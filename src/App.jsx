import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AnnouncementsBanner from './components/AnnouncementsBanner';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import TaskManagerView from './components/TaskManagerView';
import AnnouncementsView from './components/AnnouncementsView';
import EventModal from './components/EventModal';
import TaskModal from './components/TaskModal';
import AnnouncementModal from './components/AnnouncementModal';
import FirebaseModal from './components/FirebaseModal';
import AuthModal from './components/AuthModal';
import { FullscreenLockScreen, SecuritySettingsModal } from './components/SecurityLockModal';
import ToastContainer from './components/ToastContainer';

import { 
  INITIAL_CATEGORIES, 
  INITIAL_HABITS,
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_ACTIVITIES, 
  INITIAL_TASKS 
} from './data/initialData';

import { applyCustomHexTheme } from './utils/themeEngine';
import { checkAndSendReminders, requestNotificationPermission } from './utils/notificationEngine';
import { isPinEnabled } from './utils/securityEngine';
import { 
  getSavedFirebaseConfig, 
  initFirebase, 
  syncDataToRealtimeDB, 
  subscribeToRealtimeDB,
  onAuthUserChanged,
  logoutUser
} from './services/firebaseService';

export default function App() {
  // Navigation & Theme States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('chronos_theme') || 'royal_blue');
  const [customHex, setCustomHex] = useState(() => localStorage.getItem('chronos_custom_hex') || '#2563eb');
  
  // User Profile & Firebase Auth User State
  const [userName, setUserName] = useState(() => localStorage.getItem('chronos_user_name') || 'Husein Rosid');
  const [authUser, setAuthUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Security Lock States
  const [isLocked, setIsLocked] = useState(() => isPinEnabled());
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Firebase Connection Status
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Read Announcements Tracking State (for clearing red badge)
  const [readAnnouncementIds, setReadAnnouncementIds] = useState(() => {
    const saved = localStorage.getItem('chronos_read_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  // Main Data States with LocalStorage & Firebase Cloud Sync
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('chronos_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('chronos_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('chronos_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('chronos_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Modal States
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [defaultDateForEvent, setDefaultDateForEvent] = useState(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Automatically mark all announcements as read when user clicks Announcements tab
  useEffect(() => {
    if (activeTab === 'announcements' && announcements.length > 0) {
      const allIds = announcements.map(a => a.id);
      setReadAnnouncementIds(prev => {
        const next = Array.from(new Set([...prev, ...allIds]));
        localStorage.setItem('chronos_read_announcements', JSON.stringify(next));
        return next;
      });
    }
  }, [activeTab, announcements]);

  // Toggle Habit State with LocalStorage & Firebase Sync
  const handleToggleHabit = (habitId) => {
    setHabits(prevHabits => {
      const updated = prevHabits.map(h => h.id === habitId ? { ...h, done: !h.done } : h);
      localStorage.setItem('chronos_habits', JSON.stringify(updated));
      return updated;
    });
  };

  // Auto-Lock on Tab Visibility Change / Blur if PIN is set
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPinEnabled()) {
        setIsLocked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Theme Sync Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('chronos_theme', currentTheme);
    localStorage.setItem('chronos_custom_hex', customHex);
    applyCustomHexTheme(customHex);
  }, [currentTheme, customHex]);

  useEffect(() => {
    localStorage.setItem('chronos_user_name', userName);
  }, [userName]);

  // Sync LocalStorage & Firebase Realtime Database
  useEffect(() => {
    localStorage.setItem('chronos_habits', JSON.stringify(habits));
    localStorage.setItem('chronos_announcements', JSON.stringify(announcements));
    localStorage.setItem('chronos_activities', JSON.stringify(activities));
    localStorage.setItem('chronos_tasks', JSON.stringify(tasks));
    localStorage.setItem('chronos_read_announcements', JSON.stringify(readAnnouncementIds));

    // Cloud Sync to Firebase Realtime DB if authenticated
    if (firebaseConnected && authUser) {
      syncDataToRealtimeDB(authUser.uid, {
        habits,
        activities,
        tasks,
        announcements,
        readAnnouncementIds,
        theme: currentTheme,
        customHex,
        userName
      });
    }
  }, [habits, announcements, activities, tasks, readAnnouncementIds, currentTheme, customHex, userName, firebaseConnected, authUser]);

  // Ref to track if cloud data has been loaded once on login (prevents race conditions)
  const hasLoadedCloudOnce = React.useRef(false);

  // Initialize Firebase Cloud & Auth State Listener on Mount
  useEffect(() => {
    const savedConfigRaw = localStorage.getItem('chronos_firebase_config');
    if (savedConfigRaw) {
      try {
        const parsed = JSON.parse(savedConfigRaw);
        if (parsed.apiKey && !parsed.apiKey.startsWith('AIzaSyDvObGbBD4WRHURZwWtHddezW5FZy_Ig4M')) {
          localStorage.removeItem('chronos_firebase_config');
        }
      } catch (e) {}
    }

    const fbConfig = getSavedFirebaseConfig();
    if (fbConfig && fbConfig.apiKey && fbConfig.projectId) {
      const res = initFirebase(fbConfig);
      if (res) {
        setFirebaseConnected(true);

        const unsubscribeAuth = onAuthUserChanged((user) => {
          if (user) {
            setAuthUser(user);
            const userDisplayName = user.displayName || user.email.split('@')[0];
            setUserName(userDisplayName);

            const unsubscribeDB = subscribeToRealtimeDB(user.uid, (cloudData) => {
              if (!cloudData) return;
              
              // Only apply cloud data on initial load to prevent overwriting local additions
              if (!hasLoadedCloudOnce.current) {
                hasLoadedCloudOnce.current = true;
                if (cloudData.habits && Array.isArray(cloudData.habits)) setHabits(cloudData.habits);
                if (cloudData.activities && Array.isArray(cloudData.activities)) setActivities(cloudData.activities);
                if (cloudData.tasks && Array.isArray(cloudData.tasks)) setTasks(cloudData.tasks);
                if (cloudData.announcements && Array.isArray(cloudData.announcements)) setAnnouncements(cloudData.announcements);
                if (cloudData.readAnnouncementIds) setReadAnnouncementIds(cloudData.readAnnouncementIds);
                if (cloudData.theme) setCurrentTheme(cloudData.theme);
                if (cloudData.customHex) setCustomHex(cloudData.customHex);
              }
            });

            return () => {
              if (unsubscribeDB) unsubscribeDB();
            };
          } else {
            setAuthUser(null);
            hasLoadedCloudOnce.current = false;
          }
        });

        return () => {
          if (unsubscribeAuth) unsubscribeAuth();
        };
      }
    }
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setAuthUser(null);
    addToast('Berhasil Keluar dari Akun Firebase');
  };

  // Automated Web Notification Engine
  useEffect(() => {
    requestNotificationPermission();
    checkAndSendReminders(activities, tasks, addToast);
    const interval = setInterval(() => {
      checkAndSendReminders(activities, tasks, addToast);
    }, 30000);
    return () => clearInterval(interval);
  }, [activities, tasks]);

  // Handler Actions
  const handleOpenAddModal = (type, defaultDate = null) => {
    setEditingItem(null);
    setDefaultDateForEvent(defaultDate);
    setModalType(type);
  };

  // Activity Handlers
  const handleSaveActivity = (activityData) => {
    let actId = editingItem ? editingItem.id : `act-${Date.now()}`;
    let updatedActivity = { ...activityData, id: actId };

    if (editingItem) {
      setActivities(activities.map(a => a.id === editingItem.id ? updatedActivity : a));
    } else {
      setActivities([updatedActivity, ...activities]);
    }

    // Sync with Announcements if addToAnnouncements is checked or unchecked
    const annId = `ann-from-${actId}`;
    if (activityData.addToAnnouncements) {
      const newAnn = {
        id: annId,
        title: `Agenda: ${activityData.title}`,
        message: activityData.notes ? activityData.notes : `Agenda ${activityData.title} dijadwalkan pada ${activityData.date} ${activityData.isAllDay ? '(Sepanjang Hari)' : `pukul ${activityData.startTime} WIB`}.`,
        priority: activityData.priority || 'high',
        date: activityData.date,
        time: activityData.isAllDay ? 'Sepanjang Hari' : activityData.startTime,
        type: 'event'
      };

      setAnnouncements(prevAnn => {
        const existingIdx = prevAnn.findIndex(a => a.id === annId);
        if (existingIdx >= 0) {
          const updated = [...prevAnn];
          updated[existingIdx] = newAnn;
          return updated;
        } else {
          return [newAnn, ...prevAnn];
        }
      });

      addToast('Agenda & Spanduk Pengumuman berhasil disimpan!');
    } else {
      // If toggle is turned off, remove corresponding announcement
      setAnnouncements(prevAnn => prevAnn.filter(a => a.id !== annId));
      addToast(editingItem ? 'Agenda kegiatan berhasil diperbarui!' : 'Agenda kegiatan baru berhasil ditambahkan!');
    }

    setModalType(null);
    setEditingItem(null);
  };

  const handleDeleteActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
    setAnnouncements(prevAnn => prevAnn.filter(a => a.id !== `ann-from-${id}`));
    addToast('Agenda kegiatan berhasil dihapus.');
  };

  const handleOpenEditActivity = (act) => {
    setEditingItem(act);
    setModalType('event');
  };

  // Task Handlers
  const handleSaveTask = (taskData) => {
    let taskId = editingItem ? editingItem.id : `task-${Date.now()}`;
    
    // Manage completedAt timestamp for monthly recap & history
    let completedAt = editingItem ? editingItem.completedAt : null;
    if (taskData.status === 'done') {
      if (!completedAt) completedAt = new Date().toISOString();
    } else {
      completedAt = null;
    }

    let updatedTask = { ...taskData, id: taskId, completedAt };

    if (editingItem) {
      setTasks(tasks.map(t => t.id === editingItem.id ? updatedTask : t));
    } else {
      setTasks([updatedTask, ...tasks]);
    }

    if (taskData.addToCalendar) {
      const calendarActivity = {
        id: `act-from-${taskId}`,
        title: taskData.title,
        category: taskData.category,
        date: taskData.dueDate || new Date().toISOString().split('T')[0],
        startTime: taskData.dueTime || '09:00',
        endTime: taskData.calendarEndTime || '10:00',
        priority: taskData.priority,
        notes: taskData.notes ? `[Tugas] ${taskData.notes}` : '[Tugas dari Manajemen Tugas]',
        location: 'Tugas Terjadwal',
        reminder: true,
        reminderTime: 15
      };

      setActivities(prevActs => {
        const existingIdx = prevActs.findIndex(a => a.id === calendarActivity.id);
        if (existingIdx >= 0) {
          const newActs = [...prevActs];
          newActs[existingIdx] = calendarActivity;
          return newActs;
        } else {
          return [calendarActivity, ...prevActs];
        }
      });

      addToast('Tugas & Agenda Kalender berhasil disimpan!');
    } else {
      addToast(editingItem ? 'Tugas berhasil diperbarui!' : 'Tugas baru berhasil ditambahkan!');
    }

    setModalType(null);
    setEditingItem(null);
  };

  const handleToggleTaskStatus = (taskId, specificStatus = null) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        let newStatus = specificStatus;
        if (!newStatus) {
          newStatus = t.status === 'done' ? 'to-do' : 'done';
        }
        const completedAt = newStatus === 'done' ? (t.completedAt || new Date().toISOString()) : null;
        return { ...t, status: newStatus, completedAt };
      }
      return t;
    }));
    addToast('Status tugas diperbarui!');
  };

  const handleToggleSubtask = (taskId, subId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    addToast('Tugas berhasil dihapus.');
  };

  const handleOpenEditTask = (task) => {
    setEditingItem(task);
    setModalType('task');
  };

  // Announcement Handlers
  const handleSaveAnnouncement = (annData) => {
    if (editingItem) {
      setAnnouncements(announcements.map(a => a.id === editingItem.id ? { ...annData, id: editingItem.id } : a));
      addToast('Pengumuman berhasil diperbarui!');
    } else {
      const newAnn = { ...annData, id: `ann-${Date.now()}` };
      setAnnouncements([newAnn, ...announcements]);
      addToast('Pengumuman baru dipublikasikan!');
    }
    setModalType(null);
    setEditingItem(null);
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    addToast('Pengumuman dihapus.');
  };

  const handleOpenEditAnnouncement = (ann) => {
    setEditingItem(ann);
    setModalType('announcement');
  };

  // Backup & Data Management
  const handleExportData = () => {
    const backupData = {
      theme: currentTheme,
      customHex,
      userName,
      habits,
      activities,
      tasks,
      announcements,
      exportDate: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ChronosHub_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    addToast('Backup data JSON berhasil didownload!');
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.habits) setHabits(data.habits);
        if (data.activities) setActivities(data.activities);
        if (data.tasks) setTasks(data.tasks);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.theme) setCurrentTheme(data.theme);
        if (data.customHex) {
          setCustomHex(data.customHex);
          applyCustomHexTheme(data.customHex);
        }
        if (data.userName) setUserName(data.userName);
        addToast('Data berhasil di-restore!');
      } catch (err) {
        addToast('File JSON tidak valid!', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh data ke sampel awal? Data saat ini akan ditimpa.')) {
      setActivities(INITIAL_ACTIVITIES);
      setTasks(INITIAL_TASKS);
      setAnnouncements(INITIAL_ANNOUNCEMENTS);
      setHabits(INITIAL_HABITS);
      setUserName('Husein Rosid');
      setCustomHex('#2563eb');
      applyCustomHexTheme('#2563eb');
      addToast('Data telah direset!');
    }
  };

  // Calculate Unread Announcements Count (for red badge in Navbar)
  const unreadAnnouncementCount = announcements.filter(a => !readAnnouncementIds.includes(a.id)).length;

  return (
    <div className="app-container">
      
      {/* Fullscreen PIN Lock Overlay Screen */}
      <FullscreenLockScreen 
        isLocked={isLocked}
        onUnlock={() => {
          setIsLocked(false);
          addToast('Aplikasi Berhasil Dibuka!', 'success');
        }}
      />

      {/* Top Sticky Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentTheme={currentTheme}
        setTheme={setCurrentTheme}
        customHex={customHex}
        setCustomHex={setCustomHex}
        userName={userName}
        setUserName={setUserName}
        authUser={authUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenAddModal={handleOpenAddModal}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onLockApp={() => {
          if (isPinEnabled()) {
            setIsLocked(true);
          } else {
            setIsSecurityModalOpen(true);
          }
        }}
        firebaseConnected={firebaseConnected}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
        announcementCount={unreadAnnouncementCount}
      />

      {/* Announcements Banner */}
      {(activeTab === 'dashboard' || activeTab === 'calendar') && (
        <AnnouncementsBanner 
          announcements={announcements}
          onOpenAddModal={handleOpenAddModal}
          onDeleteAnnouncement={handleDeleteAnnouncement}
        />
      )}

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardView 
            userName={userName}
            setUserName={setUserName}
            activities={activities}
            tasks={tasks}
            categories={categories}
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onOpenAddModal={handleOpenAddModal}
            onToggleTaskStatus={handleToggleTaskStatus}
            onToggleSubtask={handleToggleSubtask}
            onOpenEditActivity={handleOpenEditActivity}
            onOpenEditTask={handleOpenEditTask}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView 
            activities={activities}
            categories={categories}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditActivity={handleOpenEditActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManagerView 
            tasks={tasks}
            categories={categories}
            onOpenAddModal={handleOpenAddModal}
            onToggleTaskStatus={handleToggleTaskStatus}
            onToggleSubtask={handleToggleSubtask}
            onOpenEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsView 
            announcements={announcements}
            onOpenAddModal={handleOpenAddModal}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onOpenEditAnnouncement={handleOpenEditAnnouncement}
          />
        )}
      </main>

      {/* Modals */}
      <EventModal 
        isOpen={modalType === 'event'}
        onClose={() => setModalType(null)}
        onSave={handleSaveActivity}
        categories={categories}
        initialData={editingItem}
        defaultDate={defaultDateForEvent}
      />

      <TaskModal 
        isOpen={modalType === 'task'}
        onClose={() => setModalType(null)}
        onSave={handleSaveTask}
        categories={categories}
        initialData={editingItem}
      />

      <AnnouncementModal 
        isOpen={modalType === 'announcement'}
        onClose={() => setModalType(null)}
        onSave={handleSaveAnnouncement}
        initialData={editingItem}
      />

      <FirebaseModal 
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConfigSaved={() => {
          setFirebaseConnected(true);
          addToast('Firebase Realtime DB Berhasil Dihubungkan!', 'success');
        }}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onAuthSuccess={(user) => {
          addToast(`Selamat datang, ${user.displayName || user.email}!`, 'success');
        }}
      />

      <SecuritySettingsModal 
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onPinUpdated={() => {
          addToast('PIN Keamanan Berhasil Diperbarui!');
        }}
      />

      {/* Floating Toast Notification */}
      <ToastContainer toasts={toasts} />

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.82rem', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
        Chronos Personal Hub &copy; {new Date().getFullYear()} • by Husein Rosid
      </footer>

    </div>
  );
}
