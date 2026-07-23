import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  LayoutDashboard, 
  Bell, 
  Plus, 
  Palette, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  Clock,
  Check,
  Copy,
  Volume2,
  Flame,
  Lock,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  Zap,
  Smartphone
} from 'lucide-react';
import { THEME_PRESETS, applyCustomHexTheme } from '../utils/themeEngine';
import { requestNotificationPermission } from '../utils/notificationEngine';
import { SOUND_OPTIONS, playNotificationSound } from '../utils/soundEngine';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentTheme, 
  setTheme,
  customHex,
  setCustomHex,
  userName,
  setUserName,
  authUser,
  onOpenAuthModal,
  onLogout,
  onOpenAddModal, 
  onOpenFirebaseModal,
  onOpenSecurityModal,
  onLockApp,
  firebaseConnected,
  onExportData, 
  onImportData, 
  onResetData,
  announcementCount 
}) {
  const [time, setTime] = useState(new Date());
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);
  
  // PWA Install Event Handler State
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const [hexInput, setHexInput] = useState(customHex || '#2563eb');
  const [notifPermission, setNotifPermission] = useState('default');
  const [activeSound, setActiveSound] = useState(() => localStorage.getItem('chronos_notification_sound') || 'bell');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const formattedTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'calendar', label: 'Jadwal & Kalender', icon: Calendar },
    { id: 'tasks', label: 'Manajemen Tugas', icon: CheckSquare },
    { id: 'announcements', label: 'Pengumuman', icon: Bell, badge: announcementCount }
  ];

  const handleSelectPresetTheme = (preset) => {
    setTheme(preset.id);
    setCustomHex(preset.hex);
    applyCustomHexTheme(preset.hex);
  };

  const handleApplyCustomHex = (e) => {
    e.preventDefault();
    setTheme('custom');
    setCustomHex(hexInput);
    applyCustomHexTheme(hexInput);
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(hexInput);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  const handleEnableNotifications = () => {
    requestNotificationPermission();
    setTimeout(() => {
      if ('Notification' in window) {
        setNotifPermission(Notification.permission);
      }
    }, 1000);
  };

  return (
    <header className="glass-panel" style={{ padding: '0.85rem 1.25rem', position: 'sticky', top: '12px', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
        
        {/* Brand Logo & Real-time Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} color="#ffffff" fill="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.1, color: '#fff' }}>
                CHRONOS<span className="gradient-text">.HUB</span>
              </h1>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.04em' }}>
                PERSONAL ACTIVITY SUITE
              </p>
            </div>
          </div>

          {/* Enlarged Time & Date Badge */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.65rem', 
            background: 'var(--bg-primary)', 
            padding: '0.5rem 1rem', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <Clock size={20} color="var(--accent-light)" />
            <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '1.3rem', color: '#ffffff', letterSpacing: '0.02em' }}>
              {formattedTime}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
              • {formattedDate}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  border: isActive ? 'none' : 'transparent',
                  background: isActive ? 'var(--accent-primary)' : 'transparent',
                  position: 'relative'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span style={{
                    background: 'var(--status-urgent)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginLeft: '4px'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Firebase Cloud, Web Notification, Theme Selector, Quick Add, Data Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          {/* PWA Install Button */}
          <button
            onClick={() => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                  if (choiceResult.outcome === 'accepted') {
                    console.log('User installed PWA');
                  }
                  setDeferredPrompt(null);
                });
              } else {
                alert('📱 Cara Instal Aplikasi PWA:\n\n1. Di HP Android (Chrome): Klik titik tiga (⋮) di kanan atas browser -> pilih "Tambahkan ke Layar Utama" / "Instal Aplikasi".\n\n2. Di iPhone (Safari): Klik tombol Bagikan (Share) -> pilih "Tambah ke Layar Utama" (Add to Home Screen).');
              }
            }}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.78rem', padding: '0.38rem 0.75rem', gap: '0.4rem', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', border: 'none' }}
            title="Instal Aplikasi di Layar HP / PC"
          >
            <Smartphone size={15} />
            <span>Install App</span>
          </button>
          
          {/* Auth User Profile / Login Button */}
          {authUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid var(--accent-primary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-md)' }}>
              <User size={14} color="var(--accent-light)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {authUser.displayName || authUser.email.split('@')[0]}
              </span>
              <button 
                onClick={onLogout} 
                className="btn btn-secondary btn-icon" 
                style={{ width: '26px', height: '26px', border: 'none', background: 'transparent' }}
                title="Keluar / Logout"
              >
                <LogOut size={13} color="#f87171" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <LogIn size={15} color="var(--accent-light)" />
              <span>Masuk / Akun</span>
            </button>
          )}

          {/* Lock App Now Button */}
          <button
            onClick={() => onLockApp()}
            className="btn btn-secondary btn-icon"
            style={{ 
              width: '36px', 
              height: '36px'
            }}
            title="Kunci Aplikasi Sekarang"
          >
            <Lock size={16} color="var(--accent-light)" />
          </button>

          {/* Firebase Cloud Sync Button */}
          <button
            onClick={() => onOpenFirebaseModal()}
            className="btn btn-secondary btn-icon"
            style={{ 
              width: '36px', 
              height: '36px', 
              borderColor: firebaseConnected ? '#34d399' : 'var(--border-color)',
              color: firebaseConnected ? '#34d399' : '#f59e0b'
            }}
            title={firebaseConnected ? '🟢 Firebase Cloud Sync Aktif' : '🔥 Hubungkan ke Firebase Cloud'}
          >
            <Flame size={16} color={firebaseConnected ? '#34d399' : '#f59e0b'} />
          </button>

          {/* Web Notification Toggle Button */}
          <button
            onClick={handleEnableNotifications}
            className="btn btn-secondary btn-icon"
            style={{ 
              width: '36px', 
              height: '36px', 
              borderColor: notifPermission === 'granted' ? 'var(--status-low)' : 'var(--border-color)',
              color: notifPermission === 'granted' ? 'var(--status-low)' : 'var(--text-muted)'
            }}
            title={notifPermission === 'granted' ? 'Notifikasi Web Aktif' : 'Aktifkan Pengingat Notifikasi Browser'}
          >
            <Volume2 size={16} />
          </button>

          {/* Quick Add Button */}
          <button 
            onClick={() => onOpenAddModal('event')}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          >
            <Plus size={16} />
            <span>Tambah Kegiatan</span>
          </button>

          {/* Expanded 15 Theme Color Presets + Custom HEX Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowThemeMenu(!showThemeMenu); setShowDataMenu(false); }}
              className="btn btn-secondary btn-icon"
              style={{ width: '36px', height: '36px' }}
              title="Pilihan 15 Warna & Custom Kode HEX"
            >
              <Palette size={16} color="var(--accent-light)" />
            </button>

            {showThemeMenu && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '310px',
                maxHeight: '80vh',
                overflowY: 'auto',
                padding: '0.85rem',
                zIndex: 200,
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-card)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                  🎨 15 OPSI WARNA & TEMA CUSTOM
                </div>

                {/* 15 Preset Color Swatches Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                  {THEME_PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPresetTheme(p)}
                      style={{
                        width: '100%',
                        height: '34px',
                        borderRadius: '6px',
                        background: p.hex,
                        border: currentTheme === p.id ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.15s ease'
                      }}
                      title={`${p.name} (${p.hex})`}
                    >
                      {currentTheme === p.id && <Check size={14} color="#fff" />}
                    </button>
                  ))}
                </div>

                {/* Option 16: Custom HEX Color Code Customizer */}
                <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    16. CUSTOMISASI KODE HEX WARNA
                  </div>

                  <form onSubmit={handleApplyCustomHex} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input 
                        type="color" 
                        value={hexInput}
                        onChange={(e) => { setHexInput(e.target.value); applyCustomHexTheme(e.target.value); }}
                        style={{ width: '38px', height: '38px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <input 
                        type="text" 
                        placeholder="#2563eb"
                        value={hexInput}
                        onChange={(e) => setHexInput(e.target.value)}
                        className="input-field"
                        style={{ flex: 1, fontFamily: 'monospace', textTransform: 'uppercase', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                      />
                      <button 
                        type="button"
                        onClick={handleCopyHex}
                        className="btn btn-secondary btn-icon"
                        style={{ width: '38px', height: '38px' }}
                        title="Copy Kode HEX"
                      >
                        {copiedHex ? <Check size={14} color="var(--status-low)" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      Terapkan Kode HEX Custom
                    </button>
                  </form>
                </div>

              </div>
            )}
          </div>

          {/* Data Backup & Restore Menu */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowDataMenu(!showDataMenu); setShowThemeMenu(false); }}
              className="btn btn-secondary btn-icon"
              style={{ width: '36px', height: '36px' }}
              title="Backup & Restore Data"
            >
              <Download size={16} />
            </button>

            {showDataMenu && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '210px',
                padding: '0.6rem',
                zIndex: 200,
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-card)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', paddingLeft: '0.4rem' }}>
                  MANAJEMEN DATA
                </div>
                {/* Ringtone / Sound Selector */}
                <div style={{ padding: '0.45rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Volume2 size={13} color="var(--accent-light)" /> NADA DERING NOTIFIKASI
                  </div>
                  <select 
                    value={activeSound}
                    onChange={(e) => {
                      setActiveSound(e.target.value);
                      localStorage.setItem('chronos_notification_sound', e.target.value);
                      playNotificationSound(e.target.value);
                    }}
                    className="select-field"
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem', height: '32px' }}
                  >
                    {SOUND_OPTIONS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => playNotificationSound(activeSound)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', marginTop: '0.35rem', fontSize: '0.72rem', padding: '2px 6px' }}
                  >
                    ▶ TES NADA DERING
                  </button>
                </div>

                <button
                  onClick={() => {
                    const newName = window.prompt('Masukkan Nama Anda:', userName);
                    if (newName && newName.trim()) setUserName(newName.trim());
                    setShowDataMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  <Sparkles size={15} color="var(--accent-light)" />
                  Ubah Nama ({userName})
                </button>

                <button
                  onClick={() => {
                    onOpenSecurityModal();
                    setShowDataMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  <ShieldCheck size={15} color="var(--accent-light)" />
                  Atur PIN Keamanan
                </button>

                <button
                  onClick={() => { onExportData(); setShowDataMenu(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  <Download size={15} color="var(--accent-light)" />
                  Export JSON Backup
                </button>

                <label
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    marginTop: '2px'
                  }}
                >
                  <Upload size={15} color="var(--category-work)" />
                  Import JSON Data
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={(e) => { onImportData(e); setShowDataMenu(false); }} 
                    style={{ display: 'none' }} 
                  />
                </label>

                <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.4rem 0' }} />

                <button
                  onClick={() => { onResetData(); setShowDataMenu(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  <RotateCcw size={15} />
                  Reset Data Awal
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
