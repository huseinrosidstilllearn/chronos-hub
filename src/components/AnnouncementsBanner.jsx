import React, { useState } from 'react';
import { Bell, AlertTriangle, Plus, CheckCircle2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/dateUtils';

export default function AnnouncementsBanner({ announcements, onOpenAddModal, onDeleteAnnouncement }) {
  const [showAll, setShowAll] = useState(false);

  if (!announcements || announcements.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(37, 99, 235, 0.15)', padding: '0.6rem', borderRadius: '10px' }}>
            <Bell size={22} color="var(--accent-light)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Pengumuman & Alert Kegiatan</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Tidak ada pengumuman kegiatan baru saat ini. Semua jadwal aman!
            </p>
          </div>
        </div>
        <button onClick={() => onOpenAddModal('announcement')} className="btn btn-secondary btn-sm">
          <Plus size={14} /> Buat Pengumuman
        </button>
      </div>
    );
  }

  // Display up to 5 items by default, or all if expanded
  const displayCount = showAll ? announcements.length : 5;
  const visibleAnnouncements = announcements.slice(0, displayCount);
  const remainingCount = announcements.length - 5;

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'badge-urgent';
      case 'high': return 'badge-high';
      default: return 'badge-medium';
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '1.25rem 1.5rem', 
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderLeft: '4px solid var(--accent-primary)'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(37, 99, 235, 0.2)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} color="var(--accent-light)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                Pengumuman & Alert Kegiatan
              </h3>
              <span style={{ 
                background: 'var(--accent-primary)', 
                color: '#fff', 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                padding: '2px 7px', 
                borderRadius: '4px' 
              }}>
                {announcements.length} Aktif
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Daftar pengumuman dan peringatan agenda terdekat
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {announcements.length > 5 && (
            <button 
              onClick={() => setShowAll(!showAll)} 
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showAll ? 'Tampilkan 5 Saja' : `Lihat Semua (${announcements.length})`}
            </button>
          )}
          <button 
            onClick={() => onOpenAddModal('announcement')} 
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} /> Buat Pengumuman
          </button>
        </div>
      </div>

      {/* Vertical List Stack (Direction Downwards, Up to 5 Items) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {visibleAnnouncements.map((item, idx) => {
          const isUrgent = item.priority === 'urgent';
          const borderColor = isUrgent ? 'var(--status-urgent)' : item.priority === 'high' ? 'var(--status-high)' : 'var(--accent-primary)';

          return (
            <div 
              key={item.id}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderLeft: `4px solid ${borderColor}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'border-color 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  {isUrgent ? (
                    <AlertTriangle size={18} color="var(--status-urgent)" />
                  ) : (
                    <Bell size={18} color="var(--accent-light)" />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${getPriorityBadgeClass(item.priority)}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      {item.priority ? item.priority.toUpperCase() : 'INFO'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} color="var(--accent-light)" />
                      {formatDateDDMMYYYY(item.date)} {item.time ? `• ${item.time} WIB` : ''}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                    {item.message}
                  </p>
                </div>
              </div>

              {/* Action: Mark as read / delete */}
              <button 
                onClick={() => onDeleteAnnouncement(item.id)}
                className="btn btn-secondary btn-icon"
                style={{ width: '28px', height: '28px', flexShrink: 0 }}
                title="Tandai Sudah Dibaca / Hapus"
              >
                <CheckCircle2 size={15} color="var(--status-low)" />
              </button>
            </div>
          );
        })}
      </div>

      {!showAll && remainingCount > 0 && (
        <div style={{ textAlign: 'center', paddingTop: '0.25rem' }}>
          <button 
            onClick={() => setShowAll(true)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--accent-light)', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            + {remainingCount} pengumuman lainnya (Klik untuk lihat semua)
          </button>
        </div>
      )}

    </div>
  );
}
