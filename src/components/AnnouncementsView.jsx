import React from 'react';
import { Bell, AlertTriangle, Plus, Trash2, Edit, CheckCircle2, Clock } from 'lucide-react';

export default function AnnouncementsView({ announcements, onOpenAddModal, onDeleteAnnouncement, onOpenEditAnnouncement }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.2rem 0' }}>
            Pusat Pengumuman & Alert Kegiatan
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Kelola pengumuman penting, notifikasi agenda terdekat, dan pesan pengingat kritis.
          </p>
        </div>

        <button onClick={() => onOpenAddModal('announcement')} className="btn btn-primary">
          <Plus size={16} /> Pengumuman Baru
        </button>
      </div>

      {/* Announcements Cards Grid */}
      {announcements.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bell size={42} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Tidak ada pengumuman aktif
          </h3>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            Buat pengumuman baru untuk menampilkan notifikasi pada dashboard utama.
          </p>
          <button onClick={() => onOpenAddModal('announcement')} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            + Buat Pengumuman Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {announcements.map(ann => {
            const isUrgent = ann.priority === 'urgent';
            return (
              <div 
                key={ann.id}
                className="glass-panel glass-panel-hover"
                style={{ 
                  padding: '1.25rem',
                  borderLeft: `5px solid ${isUrgent ? 'var(--status-urgent)' : 'var(--accent-primary)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className={`badge ${isUrgent ? 'badge-urgent' : ann.priority === 'high' ? 'badge-high' : 'badge-medium'}`}>
                      {ann.priority ? ann.priority.toUpperCase() : 'INFO'}
                    </span>

                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} /> {ann.date} {ann.time ? `@ ${ann.time}` : ''}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-main)' }}>
                    {ann.title}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {ann.message}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <button onClick={() => onOpenEditAnnouncement(ann)} className="btn btn-secondary btn-sm">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => onDeleteAnnouncement(ann.id)} className="btn btn-secondary btn-sm" style={{ color: '#f87171' }}>
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
