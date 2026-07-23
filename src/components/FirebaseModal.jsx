import React, { useState, useEffect } from 'react';
import { X, Flame, Cloud, Check, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { getSavedFirebaseConfig, saveFirebaseConfig } from '../services/firebaseService';

export default function FirebaseModal({ isOpen, onClose, onConfigSaved }) {
  const [config, setConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  const [status, setStatus] = useState('idle'); // 'idle' | 'connected' | 'error'

  useEffect(() => {
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setConfig(saved);
      if (saved.apiKey && saved.projectId) setStatus('connected');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!config.apiKey || !config.projectId) {
      setStatus('error');
      return;
    }

    const res = saveFirebaseConfig(config);
    if (res) {
      setStatus('connected');
      if (onConfigSaved) onConfigSaved(config);
      setTimeout(() => onClose(), 1200);
    } else {
      setStatus('error');
    }
  };

  const handleClear = () => {
    localStorage.removeItem('chronos_firebase_config');
    setConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });
    setStatus('idle');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '650px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.45rem', borderRadius: '8px' }}>
              <Flame size={22} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                Pengaturan Firebase Realtime Database
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Sinkronisasi data otomatis lintas perangkat secara instan & real-time.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Status Indicator Banner */}
        <div style={{ 
          padding: '0.85rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          background: status === 'connected' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
          border: `1px solid ${status === 'connected' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Cloud size={20} color={status === 'connected' ? '#34d399' : 'var(--accent-light)'} />
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: status === 'connected' ? '#34d399' : '#fff', display: 'block' }}>
                {status === 'connected' ? '🟢 Realtime Database Terhubung & Aktif' : '🟡 Mode LocalStorage Standalone'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {status === 'connected' ? 'Data otomatis tersinkron via Firebase Realtime Database.' : 'Data tersimpan di penyimpanan browser lokal.'}
              </span>
            </div>
          </div>

          {status === 'connected' && (
            <button onClick={handleClear} className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem', color: '#f87171' }}>
              Putuskan Firebase
            </button>
          )}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                API KEY *
              </label>
              <input 
                type="text" 
                placeholder="AIzaSyD..."
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                PROJECT ID *
              </label>
              <input 
                type="text" 
                placeholder="chronos-hub-12345"
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                AUTH DOMAIN
              </label>
              <input 
                type="text" 
                placeholder="chronos-hub.firebaseapp.com"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                APP ID
              </label>
              <input 
                type="text" 
                placeholder="1:1234567890:web:abcdef..."
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Quick Guide Card */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-light)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={14} /> PANDUAN SINGKAT FIREBASE:
            </div>
            <ol style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '1.1rem', margin: 0, lineHeight: 1.45 }}>
              <li>Buka <strong>console.firebase.google.com</strong> & buat project baru secara gratis.</li>
              <li>Pilih <strong>Build -&gt; Firestore Database</strong> lalu buat database di mode test/active.</li>
              <li>Tambahkan <strong>Web App</strong> di Project Settings, lalu copy kode `firebaseConfig` ke form di atas.</li>
            </ol>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Tutup
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Hubungkan & Simpan Firebase
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
