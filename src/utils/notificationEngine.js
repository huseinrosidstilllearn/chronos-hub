import { playNotificationSound } from './soundEngine';

export function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Browser notification permission:', permission);
      });
    }
  }
}

export function checkAndSendReminders(activities, tasks, addToast) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(todayStr);

  const sentLogRaw = localStorage.getItem('chronos_sent_notifications');
  const sentLog = sentLogRaw ? JSON.parse(sentLogRaw) : {};

  // Milestone mapping
  const milestones = [
    { days: 7, label: 'H-7 (Seminggu Lagi)' },
    { days: 5, label: 'H-5 (5 Hari Lagi)' },
    { days: 3, label: 'H-3 (3 Hari Lagi)' },
    { days: 1, label: 'H-1 (Besok)' },
    { days: 0, label: 'Hari H (Hari Ini)' }
  ];

  const allItems = [
    ...activities.map(a => ({ id: a.id, title: a.title, date: a.date, time: a.startTime, type: 'Agenda' })),
    ...tasks.map(t => ({ id: t.id, title: t.title, date: t.dueDate, time: t.dueTime, type: 'Tugas' }))
  ];

  // Active ringtone sound preference
  const activeSoundId = localStorage.getItem('chronos_notification_sound') || 'bell';

  allItems.forEach(item => {
    if (!item.date) return;

    const itemDate = new Date(item.date);
    const diffTime = itemDate.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    const matchedMilestone = milestones.find(m => m.days === diffDays);

    if (matchedMilestone) {
      const logKey = `${item.id}_${diffDays}_${todayStr}`;

      if (!sentLog[logKey]) {
        // Play selected notification ringtone audio sound!
        playNotificationSound(activeSoundId);

        // Send Web Browser Notification
        try {
          new Notification(`🔔 Pengingat ${item.type}: ${item.title}`, {
            body: `Pengingat ${matchedMilestone.label}: "${item.title}" dijadwalkan pada ${item.date} ${item.time ? `@ ${item.time} WIB` : ''}.`,
            icon: '/favicon.svg',
            tag: item.id
          });
        } catch (e) {
          console.log('Error creating notification:', e);
        }

        // Trigger in-app Toast notification
        if (addToast) {
          addToast(`🔔 [${matchedMilestone.label}] ${item.type}: ${item.title}`, 'info');
        }

        // Mark as sent in log
        sentLog[logKey] = true;
      }
    }
  });

  localStorage.setItem('chronos_sent_notifications', JSON.stringify(sentLog));
}
