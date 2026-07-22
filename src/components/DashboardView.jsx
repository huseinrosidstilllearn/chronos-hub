import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Flame, 
  MapPin, 
  Plus, 
  AlertCircle, 
  ListTodo, 
  Sparkles,
  Check,
  Hand,
  Edit2,
  Droplets,
  Activity,
  BookOpen,
  Target
} from 'lucide-react';
import { isEventOccurringOnDate } from '../utils/recurrenceEngine';

export default function DashboardView({ 
  userName,
  setUserName,
  activities, 
  tasks, 
  categories, 
  habits = [],
  onToggleHabit,
  onOpenAddModal, 
  onToggleTaskStatus, 
  onToggleSubtask,
  onOpenEditActivity,
  onOpenEditTask
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const renderHabitIcon = (iconType, isDone, activeColor) => {
    const color = isDone ? activeColor : 'var(--text-muted)';
    const size = 20;

    switch (iconType) {
      case 'droplets':
        return <Droplets size={size} color={color} />;
      case 'activity':
        return <Activity size={size} color={color} />;
      case 'book':
        return <BookOpen size={size} color={color} />;
      case 'target':
      default:
        return <Target size={size} color={color} />;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter(a => isEventOccurringOnDate(a, todayStr));

  const completedTasksCount = tasks.filter(t => t.status === 'done').length;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done');

  const hour = new Date().getHours();
  let greetingText = 'Selamat Pagi';
  if (hour >= 12 && hour < 15) greetingText = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) greetingText = 'Selamat Sore';
  else if (hour >= 18 || hour < 4) greetingText = 'Selamat Malam';

  const getCategoryObj = (catId) => categories.find(c => c.id === catId) || { label: catId, bgClass: 'badge-category-work' };

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Welcome Bar & Stats Overview */}
      <div className="glass-panel" style={{ padding: '1.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          
          <div>
            {/* Enlarged Greeting Title & White Outline Hand Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '0.45rem', 
                borderRadius: '8px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Hand size={24} color="#ffffff" strokeWidth={2.2} />
              </div>

              {!isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '2.1rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    {greetingText}, <span style={{ color: 'var(--accent-light)' }}>{userName}</span>!
                  </h2>
                  <button 
                    onClick={() => { setTempName(userName); setIsEditingName(true); }}
                    className="btn btn-secondary btn-icon"
                    style={{ width: '28px', height: '28px', borderRadius: '6px' }}
                    title="Ubah Nama Pengguna"
                  >
                    <Edit2 size={13} color="var(--text-muted)" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)}
                    className="input-field"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '1.2rem', fontWeight: 700, width: '220px' }}
                    autoFocus
                  />
                  <button type="submit" className="btn btn-primary btn-sm">Simpan</button>
                  <button type="button" onClick={() => setIsEditingName(false)} className="btn btn-secondary btn-sm">Batal</button>
                </form>
              )}
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
              Semua sistem siap. Kamu memiliki <strong style={{ color: '#fff' }}>{todayActivities.length} agenda kegiatan</strong> hari ini.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <button onClick={() => onOpenAddModal('event')} className="btn btn-primary">
              <Plus size={16} /> Agenda Baru
            </button>
            <button onClick={() => onOpenAddModal('task')} className="btn btn-secondary">
              <Plus size={16} /> Tugas Baru
            </button>
          </div>

        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginTop: '1.5rem' 
        }}>
          
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>JADWAL HARI INI</span>
              <CalendarIcon size={18} color="var(--accent-light)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{todayActivities.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Aktivitas terencana</div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>TUGAS SELESAI</span>
              <CheckCircle2 size={18} color="var(--status-low)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{completedTasksCount} / {tasks.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {tasks.length > 0 ? `${Math.round((completedTasksCount / tasks.length) * 100)}% Rasio Tuntas` : '0% Tuntas'}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>PRIORITAS URGENT</span>
              <AlertCircle size={18} color="var(--status-urgent)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: urgentTasks.length > 0 ? 'var(--status-urgent)' : '#fff' }}>
              {urgentTasks.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Perlu perhatian segera</div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>STREAK KEBIASAAN</span>
              <Flame size={18} color="var(--status-high)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
              {habits.filter(h => h.done).length} / {habits.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Check-in hari ini</div>
          </div>

        </div>
      </div>

      {/* Main Grid: Agenda & Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Agenda Hari Ini Timeline */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock size={20} color="var(--accent-light)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>Timeline Agenda Hari Ini</h3>
            </div>
            <button onClick={() => onOpenAddModal('event')} className="btn btn-secondary btn-sm">
              <Plus size={14} /> Tambah
            </button>
          </div>

          {todayActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
              <Sparkles size={36} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
                Belum ada kegiatan dijadwalkan untuk hari ini.
              </p>
              <button onClick={() => onOpenAddModal('event')} className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Atur Agenda Pertama
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {todayActivities.map((act) => {
                const catObj = getCategoryObj(act.category);
                return (
                  <div 
                    key={act.id} 
                    onClick={() => onOpenEditActivity(act)}
                    className="glass-panel glass-panel-hover" 
                    style={{ 
                      padding: '1rem 1.1rem', 
                      cursor: 'pointer',
                      borderLeft: `4px solid ${catObj.color}`,
                      background: 'var(--bg-secondary)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span className={`badge ${catObj.bgClass}`}>
                            {catObj.label}
                          </span>
                          {act.priority === 'urgent' && <span className="badge badge-urgent">URGENT</span>}
                        </div>

                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.3rem 0', color: 'var(--text-main)' }}>
                          {act.title}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} color="var(--accent-light)" />
                            {act.startTime} - {act.endTime} WIB
                          </span>
                          {act.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MapPin size={13} color="var(--accent-primary)" />
                              {act.location}
                            </span>
                          )}
                        </div>

                        {act.notes && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '0.4rem 0 0 0', lineHeight: 1.3 }}>
                            {act.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Priority Tasks & Routine Check-in */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Priority Focus Tasks Widget */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ListTodo size={20} color="var(--accent-light)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>Fokus Tugas Utama</h3>
              </div>
              <button onClick={() => onOpenAddModal('task')} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Tugas Baru
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.slice(0, 4).map(task => {
                const subtasksCount = task.subtasks ? task.subtasks.length : 0;
                const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
                const isDone = task.status === 'done';

                return (
                  <div 
                    key={task.id} 
                    className="glass-panel"
                    style={{ 
                      padding: '0.85rem 1rem', 
                      background: isDone ? 'rgba(15, 23, 42, 0.5)' : 'var(--bg-secondary)',
                      opacity: isDone ? 0.7 : 1,
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <button 
                        onClick={() => onToggleTaskStatus(task.id)}
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '4px', 
                          border: isDone ? 'none' : '2px solid var(--border-color)',
                          background: isDone ? 'var(--status-low)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          marginTop: '2px',
                          flexShrink: 0
                        }}
                      >
                        {isDone && <Check size={13} color="#fff" />}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <h4 
                            onClick={() => onOpenEditTask(task)}
                            style={{ 
                              fontSize: '0.92rem', 
                              fontWeight: 600, 
                              margin: 0, 
                              cursor: 'pointer',
                              textDecoration: isDone ? 'line-through' : 'none',
                              color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {task.title}
                          </h4>
                          <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {task.priority}
                          </span>
                        </div>

                        {subtasksCount > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.35rem' }}>
                            <div style={{ flex: 1, height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${(completedSubtasks / subtasksCount) * 100}%`, 
                                height: '100%', 
                                background: 'var(--accent-primary)' 
                              }} />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {completedSubtasks}/{subtasksCount} sub-tugas
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habit Routine Check-in Widget (Lucide Vector SVG Icons with dynamic colors) */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Flame size={20} color="var(--accent-light)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Check-in Kebiasaan Harian</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {habits.map(h => (
                <div 
                  key={h.id}
                  onClick={() => onToggleHabit(h.id)}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: h.done ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-primary)',
                    border: `1px solid ${h.done ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    padding: '0.35rem', 
                    borderRadius: '6px', 
                    background: h.done ? 'rgba(255,255,255,0.08)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {renderHabitIcon(h.iconType, h.done, h.activeColor)}
                  </div>

                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    color: h.done ? '#34d399' : 'var(--text-muted)',
                    textDecoration: h.done ? 'line-through' : 'none'
                  }}>
                    {h.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
