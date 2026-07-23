import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, CalendarCheck } from 'lucide-react';
import { formatDateDDMMYYYY, HOURS_24_OPTIONS } from '../utils/dateUtils';

export default function TaskModal({ isOpen, onClose, onSave, categories, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'work',
    priority: 'medium',
    status: 'to-do',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '09:00',
    notes: '',
    subtasks: [],
    addToCalendar: true,
    calendarEndTime: '10:00'
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        subtasks: initialData.subtasks || [],
        addToCalendar: initialData.addToCalendar !== undefined ? initialData.addToCalendar : false,
        calendarEndTime: initialData.calendarEndTime || '10:00'
      });
    } else {
      setFormData({
        title: '',
        category: 'work',
        priority: 'medium',
        status: 'to-do',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '09:00',
        notes: '',
        subtasks: [],
        addToCalendar: true,
        calendarEndTime: '10:00'
      });
    }
  }, [initialData, isOpen]);

  const [titleError, setTitleError] = useState(false);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setFormData({
      ...formData,
      subtasks: [
        ...formData.subtasks,
        { id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, title: newSubtaskTitle.trim(), completed: false }
      ]
    });
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (subId) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter(s => s.id !== subId)
    });
  };

  const handleToggleSubtask = (subId) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
    });
  };

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            {initialData ? '✏️ Edit Tugas Utama' : '🎯 Buat Tugas Baru'}
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              JUDUL TUGAS *
            </label>
            <input 
              type="text" 
              placeholder="Contoh: Selesaikan Laporan Keuangan, Desain Banner Promosi"
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
                ⚠️ Judul tugas tidak boleh kosong!
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                <option value="low">🟢 Rendah</option>
                <option value="medium">🟡 Sedang</option>
                <option value="high">🟠 Tinggi</option>
                <option value="urgent">🔴 Mendesak (Urgent)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                STATUS
              </label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select-field"
              >
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Selesai (Done)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                TANGGAL (DD/MM/YYYY)
              </label>
              <input 
                type="date" 
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-light)', marginTop: '2px', display: 'block' }}>
                Format: {formatDateDDMMYYYY(formData.dueDate)}
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                JAM MULAI (24 JAM)
              </label>
              <select 
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
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
                value={formData.calendarEndTime}
                onChange={(e) => setFormData({ ...formData, calendarEndTime: e.target.value })}
                className="select-field"
              >
                {HOURS_24_OPTIONS.map(timeStr => (
                  <option key={timeStr} value={timeStr}>{timeStr} WIB</option>
                ))}
              </select>
            </div>
          </div>

          {/* Integration Option */}
          <div style={{ 
            background: 'var(--bg-primary)', 
            padding: '0.85rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CalendarCheck size={20} color="var(--accent-light)" />
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'block' }}>
                  Otomatis Masukkan ke Kalender Kegiatan
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Tugas ini akan otomatis menjadi agenda di Kalender pada tanggal {formatDateDDMMYYYY(formData.dueDate)}.
                </span>
              </div>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0 }}>
              <input 
                type="checkbox" 
                checked={formData.addToCalendar}
                onChange={(e) => setFormData({ ...formData, addToCalendar: e.target.checked })}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: formData.addToCalendar ? 'var(--accent-primary)' : 'var(--border-color)',
                borderRadius: '999px',
                transition: '0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: formData.addToCalendar ? '22px' : '3px',
                  bottom: '3px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: '0.2s'
                }} />
              </span>
            </label>
          </div>

          {/* Subtask Builder */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              SUB-TUGAS / CHECKLIST DETAIL
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Tambah langkah/sub-tugas baru..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                className="input-field"
              />
              <button type="button" onClick={handleAddSubtask} className="btn btn-secondary btn-sm">
                <Plus size={16} /> Tambah
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '120px', overflowY: 'auto' }}>
              {formData.subtasks.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => handleToggleSubtask(s.id)}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: s.completed ? 'none' : '1px solid var(--border-color)', background: s.completed ? 'var(--accent-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.completed && <Check size={11} color="#fff" />}
                    </div>
                    <span style={{ fontSize: '0.85rem', textDecoration: s.completed ? 'line-through' : 'none', color: s.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {s.title}
                    </span>
                  </div>

                  <button type="button" onClick={() => handleRemoveSubtask(s.id)} className="btn btn-secondary btn-icon" style={{ width: '22px', height: '22px', color: '#f87171' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              CATATAN
            </label>
            <textarea 
              placeholder="Detail tambahan, referensi, atau instruksi tugas..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="textarea-field"
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Simpan Perubahan' : 'Buat Tugas'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
