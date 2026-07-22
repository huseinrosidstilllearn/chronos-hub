import React, { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle } from 'lucide-react';
import { formatDateDDMMYYYY, HOURS_24_OPTIONS } from '../utils/dateUtils';

export default function AnnouncementModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'high',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'event'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        message: '',
        priority: 'high',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'event'
      });
    }
  }, [initialData, isOpen]);

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            📢 {initialData ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              JUDUL PENGUMUMAN / ALERT *
            </label>
            <input 
              type="text" 
              placeholder="🚀 Rapat Evaluasi Q3, ⚠️ Batas Akhir Tagihan Server"
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
                ⚠️ Judul pengumuman tidak boleh kosong!
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                PRIORITAS ALERT
              </label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="select-field"
              >
                <option value="urgent">🔴 Urgent / Bahaya</option>
                <option value="high">🟠 High / Penting</option>
                <option value="medium">🟡 Medium / Info</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                TANGGAL (DD/MM/YYYY)
              </label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-light)', marginTop: '2px', display: 'block' }}>
                Format: {formatDateDDMMYYYY(formData.date)}
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                JAM (24 JAM)
              </label>
              <select 
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="select-field"
              >
                {HOURS_24_OPTIONS.map(timeStr => (
                  <option key={timeStr} value={timeStr}>{timeStr} WIB</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              PESAN DETAIL PENGUMUMAN
            </label>
            <textarea 
              placeholder="Instruksi, detail pengingat, atau keterangan penting..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="textarea-field"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Pengumuman
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
