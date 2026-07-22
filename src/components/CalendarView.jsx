import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  FileText, 
  Maximize2,
  Minimize2,
  Calendar as CalendarIcon,
  Repeat,
  Sun
} from 'lucide-react';
import { formatDateDDMMYYYY, formatDateIndonesian, toYYYYMMDD, HOURS_24_OPTIONS } from '../utils/dateUtils';
import { isEventOccurringOnDate, getRecurrenceLabel } from '../utils/recurrenceEngine';

export default function CalendarView({ 
  activities, 
  categories, 
  onOpenAddModal, 
  onOpenEditActivity, 
  onDeleteActivity 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  
  // Resizable Splitter State (% width of calendar grid)
  const [calendarWidthPercent, setCalendarWidthPercent] = useState(65);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);

  // Month & Week navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setCurrentDate(prevDay);
      setSelectedDateStr(toYYYYMMDD(prevDay));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCurrentDate(nextDay);
      setSelectedDateStr(toYYYYMMDD(nextDay));
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Draggable Splitter Mouse Event Handlers
  const handleMouseDownSplitter = (e) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingSplitter) return;
    const container = document.getElementById('calendar-resizable-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    let newPercent = (offsetX / rect.width) * 100;
    if (newPercent < 30) newPercent = 30;
    if (newPercent > 80) newPercent = 80;
    setCalendarWidthPercent(newPercent);
  };

  const handleMouseUp = () => {
    if (isDraggingSplitter) {
      setIsDraggingSplitter(false);
    }
  };

  // Generate Month Grid Days
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthDays = [];

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
    monthDays.push({
      dateObj: prevDate,
      dateStr: toYYYYMMDD(prevDate),
      dayNum: daysInPrevMonth - i,
      isCurrentMonth: false
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const currDate = new Date(year, month, i);
    monthDays.push({
      dateObj: currDate,
      dateStr: toYYYYMMDD(currDate),
      dayNum: i,
      isCurrentMonth: true
    });
  }

  const remainingCells = (42 - monthDays.length) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, month + 1, i);
    monthDays.push({
      dateObj: nextDate,
      dateStr: toYYYYMMDD(nextDate),
      dayNum: i,
      isCurrentMonth: false
    });
  }

  // Generate Week Days (Sunday to Saturday)
  const currentDayOfWeek = currentDate.getDay();
  const sundayOfWeek = new Date(currentDate);
  sundayOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sundayOfWeek);
    d.setDate(sundayOfWeek.getDate() + i);
    weekDays.push({
      dateObj: d,
      dateStr: toYYYYMMDD(d),
      dayNum: d.getDate(),
      dayName: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][i]
    });
  }

  const getCategoryObj = (catId) => categories.find(c => c.id === catId) || { label: catId, color: '#2563eb', bgClass: 'badge-category-work' };

  const isEventOnDate = (act, dateStr) => {
    return isEventOccurringOnDate(act, dateStr);
  };

  const selectedDateActivities = activities.filter(a => isEventOnDate(a, selectedDateStr));

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayHeaderNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div 
      id="calendar-resizable-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', userSelect: isDraggingSplitter ? 'none' : 'auto' }}
    >
      
      {/* Calendar Header Toolbar: Prominent Month/Year Title + Control Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Prominent Month & Year Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
              <CalendarIcon size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {viewMode === 'month' && `${monthNames[month]} ${year}`}
                {viewMode === 'week' && `Minggu (${formatDateDDMMYYYY(toYYYYMMDD(weekDays[0].dateObj))} - ${formatDateDDMMYYYY(toYYYYMMDD(weekDays[6].dateObj))})`}
                {viewMode === 'day' && formatDateIndonesian(selectedDateStr)}
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Tampilan Mode: {viewMode === 'month' ? 'Tampilan Bulan (Month View)' : viewMode === 'week' ? 'Tampilan Minggu (Week View)' : 'Tampilan Harian (Day View)'}
              </span>
            </div>
          </div>

          {/* Right Grouped Control Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {/* Today & Navigation Arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button onClick={handleToday} className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
                Hari Ini
              </button>

              <button onClick={handlePrev} className="btn btn-secondary btn-icon" style={{ width: '30px', height: '30px' }} title="Sebelumnya">
                <ChevronLeft size={16} />
              </button>

              <button onClick={handleNext} className="btn btn-secondary btn-icon" style={{ width: '30px', height: '30px' }} title="Berikutnya">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View Mode Toggle: Bulan | Minggu | Hari (Functional Google Calendar View Modes) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {[
                { id: 'month', label: 'Bulan' },
                { id: 'week', label: 'Minggu' },
                { id: 'day', label: 'Hari' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setViewMode(m.id)}
                  className={`btn ${viewMode === m.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    border: 'none',
                    background: viewMode === m.id ? 'var(--accent-primary)' : 'transparent'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Quick Add Event Button */}
            <button 
              onClick={() => onOpenAddModal('event', selectedDateStr)} 
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              <Plus size={16} /> Tambah Kegiatan
            </button>

          </div>

        </div>
      </div>

      {/* Main Layout Grid according to selected View Mode */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: '0', 
        minHeight: '620px',
        position: 'relative'
      }}>
        
        {/* Left View Column */}
        <div className="glass-panel" style={{ 
          width: isMobile ? '100%' : `${calendarWidthPercent}%`, 
          padding: '1.25rem', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)'
        }}>
          
          {/* MODE 1: MONTH VIEW */}
          {viewMode === 'month' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '0.5rem', textAlign: 'center' }}>
                {dayHeaderNames.map((dayName, idx) => (
                  <div 
                    key={dayName} 
                    style={{ 
                      fontSize: '0.78rem', 
                      fontWeight: 800, 
                      color: idx === 0 || idx === 6 ? 'var(--status-high)' : 'var(--text-muted)',
                      padding: '0.4rem 0'
                    }}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', flex: 1 }}>
                {monthDays.map((dayItem) => {
                  const isSelected = dayItem.dateStr === selectedDateStr;
                  const isToday = dayItem.dateStr === toYYYYMMDD(new Date());
                  const dayActs = activities.filter(a => isEventOnDate(a, dayItem.dateStr));

                  return (
                    <div
                      key={dayItem.dateStr}
                      onClick={() => setSelectedDateStr(dayItem.dateStr)}
                      onDoubleClick={() => onOpenAddModal('event', dayItem.dateStr)}
                      style={{
                        minHeight: isMobile ? '95px' : '130px',
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected 
                          ? 'rgba(37, 99, 235, 0.18)' 
                          : (dayItem.isCurrentMonth ? 'var(--bg-primary)' : 'rgba(15, 23, 42, 0.4)'),
                        border: isSelected 
                          ? '2px solid var(--accent-primary)' 
                          : (isToday ? '1px solid var(--accent-light)' : '1px solid var(--border-color)'),
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        opacity: dayItem.isCurrentMonth ? 1 : 0.45,
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      title="Klik 2x untuk Tambah Kegiatan di Tanggal Ini"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: isToday || isSelected ? 800 : 600,
                          color: isToday ? 'var(--accent-light)' : (dayItem.isCurrentMonth ? '#ffffff' : 'var(--text-dim)'),
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isToday ? 'var(--accent-primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {dayItem.dayNum}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDateStr(dayItem.dateStr);
                              onOpenAddModal('event', dayItem.dateStr);
                            }}
                            style={{
                              background: 'rgba(255,255,255,0.1)',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#fff',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            title="Tambah Kegiatan Tanggal Ini"
                          >
                            <Plus size={12} />
                          </button>

                          {dayActs.length > 0 && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                              {dayActs.length}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
                        {dayActs.slice(0, 3).map((act) => {
                          const catObj = getCategoryObj(act.category);
                          const isMultiDay = act.endDate && act.endDate !== act.date;
                          const isStart = dayItem.dateStr === act.date;
                          const isEnd = dayItem.dateStr === (act.endDate || act.date);

                          return (
                            <div
                              key={`${act.id}-${dayItem.dateStr}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenEditActivity(act);
                              }}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '3px 6px',
                                background: isMultiDay ? catObj.color : 'rgba(255,255,255,0.08)',
                                color: isMultiDay ? '#ffffff' : catObj.color,
                                borderLeft: isMultiDay ? 'none' : `3px solid ${catObj.color}`,
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {act.isAllDay ? '☀️ ' : `${act.startTime} `}{act.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* MODE 2: WEEK VIEW (Google Calendar 7-Day Columns) */}
          {viewMode === 'week' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', flex: 1 }}>
              {weekDays.map(wDay => {
                const isSelected = wDay.dateStr === selectedDateStr;
                const isToday = wDay.dateStr === toYYYYMMDD(new Date());
                const dayActs = activities.filter(a => isEventOnDate(a, wDay.dateStr));

                return (
                  <div 
                    key={wDay.dateStr}
                    onClick={() => setSelectedDateStr(wDay.dateStr)}
                    style={{
                      background: isSelected ? 'rgba(37, 99, 235, 0.18)' : 'var(--bg-primary)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block' }}>
                        {wDay.dayName}
                      </span>
                      <span style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 800, 
                        color: isToday ? 'var(--accent-light)' : '#fff',
                        display: 'inline-block',
                        marginTop: '2px'
                      }}>
                        {wDay.dayNum}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto' }}>
                      {dayActs.map(act => {
                        const catObj = getCategoryObj(act.category);
                        return (
                          <div
                            key={act.id}
                            onClick={(e) => { e.stopPropagation(); onOpenEditActivity(act); }}
                            style={{
                              padding: '0.4rem',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.06)',
                              borderLeft: `3px solid ${catObj.color}`,
                              fontSize: '0.75rem'
                            }}
                          >
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.78rem' }}>{act.title}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{act.isAllDay ? '☀️ All Day' : act.startTime}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 3: DAY VIEW (Google Calendar 24-Hour Timeline Slot View) */}
          {viewMode === 'day' && (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '0.5rem' }}>
              {HOURS_24_OPTIONS.filter((_, idx) => idx % 4 === 0).map(hourTime => {
                const hourActs = selectedDateActivities.filter(a => a.startTime && a.startTime.startsWith(hourTime.substring(0, 2)));
                return (
                  <div key={hourTime} style={{ display: 'flex', gap: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.6rem 0' }}>
                    <span style={{ width: '65px', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {hourTime}
                    </span>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {hourActs.map(act => {
                        const catObj = getCategoryObj(act.category);
                        return (
                          <div 
                            key={act.id}
                            onClick={() => onOpenEditActivity(act)}
                            style={{
                              padding: '0.6rem 0.85rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-primary)',
                              borderLeft: `4px solid ${catObj.color}`,
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{act.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{act.isAllDay ? '☀️ Sepanjang Hari' : `${act.startTime} - ${act.endTime} WIB`}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Draggable Resizable Splitter Bar (Desktop Only) */}
        {!isMobile && (
          <div 
            onMouseDown={handleMouseDownSplitter}
            style={{
              width: '10px',
              cursor: 'col-resize',
              background: isDraggingSplitter ? 'var(--accent-primary)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'background 0.2s ease',
              margin: '0 -3px'
            }}
            title="Geser Kiri/Kanan untuk Memperluas Kalender"
          >
            <div style={{
              width: '4px',
              height: '36px',
              borderRadius: '2px',
              background: 'var(--border-color)'
            }} />
          </div>
        )}

        {/* Right: Date Detail Panel for Selected Date */}
        <div className="glass-panel" style={{ 
          width: isMobile ? '100%' : `${100 - calendarWidthPercent}%`, 
          padding: '1.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)'
        }}>
          
          {/* Detail Header */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AGENDA TANGGAL PILIHAN
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.2rem 0 0 0', color: '#ffffff' }}>
              {formatDateIndonesian(selectedDateStr)}
            </h3>

            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Format Tanggal: {formatDateDDMMYYYY(selectedDateStr)}
            </span>
          </div>

          {/* Agenda List for Selected Date */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {selectedDateActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                <CalendarIcon size={36} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                  Tidak ada agenda untuk tanggal ini.
                </p>
                <button 
                  onClick={() => onOpenAddModal('event', selectedDateStr)} 
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.75rem' }}
                >
                  <Plus size={14} /> Tambah Kegiatan
                </button>
              </div>
            ) : (
              selectedDateActivities.map(act => {
                const catObj = getCategoryObj(act.category);
                const isMultiDay = act.endDate && act.endDate !== act.date;

                return (
                  <div 
                    key={act.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '1rem', 
                      borderLeft: `4px solid ${catObj.color}`,
                      background: 'var(--bg-primary)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${catObj.bgClass}`}>
                          {catObj.label}
                        </span>
                        {act.priority === 'urgent' && <span className="badge badge-urgent">URGENT</span>}
                        {isMultiDay && <span className="badge badge-low">BERSAMBUNG</span>}
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                          onClick={() => onOpenEditActivity(act)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit Agenda"
                        >
                          <Maximize2 size={13} />
                        </button>
                        <button 
                          onClick={() => onDeleteActivity(act.id)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: '28px', height: '28px', color: '#f87171' }}
                          title="Hapus Agenda"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: '#fff' }}>
                      {act.title}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} color="var(--accent-light)" />
                        {act.isAllDay ? '☀️ Sepanjang Hari (All Day)' : `${act.startTime} - ${act.endTime} WIB`}
                      </span>

                      {isMultiDay && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-light)' }}>
                          <CalendarIcon size={14} />
                          Berlangsung: {formatDateDDMMYYYY(act.date)} s/d {formatDateDDMMYYYY(act.endDate)}
                        </span>
                      )}

                      {act.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} color="var(--accent-primary)" />
                          {act.location}
                        </span>
                      )}
                    </div>

                    {act.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.5rem 0 0 0', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                        {act.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
