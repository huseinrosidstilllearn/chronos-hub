import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Tag, AlertTriangle, FileText, Bell, Repeat, Sun } from 'lucide-react';
import { formatDateDDMMYYYY, HOURS_24_OPTIONS } from '../utils/dateUtils';
import { getRecurrenceLabel } from '../utils/recurrenceEngine';

export default function EventModal({ isOpen, onClose, onSave, categories, initialData, defaultDate }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'work',
    date: defaultDate || new Date().toISOString().split('T')[0],
    endDate: defaultDate || new Date().toISOString().split('T')[0],
    isAllDay: false,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    notes: '',
    priority: 'medium',
    reminder: true,
    reminderTime: 15,
    addToAnnouncements: false,
    recurrence: 'none' // 'none' | 'daily' | 'weekday' | 'weekly' | 'monthly' | 'yearly'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date || new Date().toISOString().split('T')[0],
        endDate: initialData.endDate || initialData.date || new Date().toISOString().split('T')[0],
        isAllDay: initialData.isAllDay || false,
        addToAnnouncements: initialData.addToAnnouncements || false,
        recurrence: initialData.recurrence || 'none'
      });
    } else {
      setFormData({
        title: '',
        category: 'work',
        date: defaultDate || new Date().toISOString().split('T')[0],
        endDate: defaultDate || new Date().toISOString().split('T')[0],
        isAllDay: false,
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        notes: '',
        priority: 'medium',
        reminder: true,
        reminderTime: 15,
        addToAnnouncements: false,
        recurrence: 'none'
      });
    }
  }, [initialData, defaultDate, isOpen]);

  const [titleError, setTitleError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '580px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            {initialData ? '✏️ Edit Agenda Kegiatan' : '✨ Tambah Agenda Kegiatan Baru'}
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              JUDUL KEGIATAN *
            </label>
            <input 
              type="text" 
              placeholder="Contoh: Rapat Evaluasi Proyek, Sesi Gym, Liburan Keluarga"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (titleError) setTitleError(false);
              }}
              className="input-field"
              style={{
                borderColor: titleError ? '#ef4444' : 'var(--border-color)'
              }}
              required
            />
            {titleError && (
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>
                ⚠️ Judul kegiatan tidak boleh kosong!
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                KATEGORI
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="select-field"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                PRIORITAS
              </label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="select-field"
              >
                <option value="low">🟢 Rendah (Low)</option>
                <option value="medium">🟡 Sedang (Medium)</option>
                <option value="high">🟠 Tinggi (High)</option>
                <option value="urgent">🔴 Mendesak (Urgent)</option>
              </select>
            </div>
          </div>

          {/* All-Day Event Checkbox Toggle */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sun size={18} color="var(--accent-light)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                Sepanjang Hari (All Day Event)
              </span>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.isAllDay}
                onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: formData.isAllDay ? 'var(--accent-primary)' : 'var(--border-color)',
                borderRadius: '999px',
                transition: '0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '16px',
                  width: '16px',
                  left: formData.isAllDay ? '21px' : '3px',
                  bottom: '3px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: '0.2s'
                }} />
              </span>
            </label>
          </div>

          {/* Date Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                TANGGAL MULAI
              </label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setFormData({ 
                    ...formData, 
                    date: newDate,
                    endDate: newDate > formData.endDate ? newDate : formData.endDate 
                  });
                }}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                TANGGAL SELESAI (BERSAMBUNG)
              </label>
              <input 
                type="date" 
                value={formData.endDate}
                min={formData.date}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Time Picker (Hidden if All Day) */}
          {!formData.isAllDay && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  JAM MULAI (24 JAM)
                </label>
                <select 
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="select-field"
                >
                  {HOURS_24_OPTIONS.map(timeStr => (
                    <option key={timeStr} value={timeStr}>{timeStr} WIB</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  JAM SELESAI (24 JAM)
                </label>
                <select 
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="select-field"
                >
                  {HOURS_24_OPTIONS.map(timeStr => (
                    <option key={timeStr} value={timeStr}>{timeStr} WIB</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Google Calendar Style Recurrence Dropdown */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Repeat size={16} color="var(--accent-light)" />
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                PENGULANGAN AGENDA (Otomatis seperti Google Calendar)
              </label>
            </div>

            <select 
              value={formData.recurrence}
              onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
              className="select-field"
              style={{ width: '100%', fontSize: '0.88rem', fontWeight: 600 }}
            >
              <option value="none">{getRecurrenceLabel('none', formData.date)}</option>
              <option value="daily">{getRecurrenceLabel('daily', formData.date)}</option>
              <option value="weekday">{getRecurrenceLabel('weekday', formData.date)}</option>
              <option value="weekly">{getRecurrenceLabel('weekly', formData.date)}</option>
              <option value="monthly">{getRecurrenceLabel('monthly', formData.date)}</option>
              <option value="yearly">{getRecurrenceLabel('yearly', formData.date)}</option>
            </select>
          </div>

          {/* Option: Add to Announcements Banner */}
          <div 
            onClick={() => setFormData({ ...formData, addToAnnouncements: !formData.addToAnnouncements })}
            style={{ 
              background: formData.addToAnnouncements ? 'rgba(37, 99, 235, 0.18)' : 'var(--bg-primary)', 
              padding: '0.85rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              border: formData.addToAnnouncements ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bell size={20} color={formData.addToAnnouncements ? 'var(--accent-light)' : 'var(--text-muted)'} />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: formData.addToAnnouncements ? '#fff' : 'var(--text-muted)', display: 'block' }}>
                  Otomatis Tampilkan di Spanduk Pengumuman
                </span>
                <span style={{ fontSize: '0.75rem', color: formData.addToAnnouncements ? 'var(--accent-light)' : 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                  {formData.addToAnnouncements ? '✅ Aktif — Agenda akan tampil di spanduk pengumuman atas' : '⚪ Matikan — Hanya tampil di kalender'}
                </span>
              </div>
            </div>

            <div style={{
              width: '44px',
              height: '24px',
              backgroundColor: formData.addToAnnouncements ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
              borderRadius: '999px',
              position: 'relative',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}>
              <div style={{
                width: '18px',
                height: '18px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: formData.addToAnnouncements ? '23px' : '3px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              LOKASI / LINK MEETING
            </label>
            <input 
              type="text" 
              placeholder="Ruang Rapat 2, Zoom Meeting, Studio FitLife"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              CATATAN TAMBAHAN
            </label>
            <textarea 
              placeholder="Catatan, agenda bahasan, atau persiapan yang dibutuhkan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="textarea-field"
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
