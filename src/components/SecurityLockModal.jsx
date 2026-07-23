import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, ShieldCheck, X, AlertCircle, Delete, Check } from 'lucide-react';
import { getSavedPin, isPinEnabled, savePin, removePin, verifyPin } from '../utils/securityEngine';

// Fullscreen App Lock Screen Overlay (when app is locked)
export function FullscreenLockScreen({ isLocked, onUnlock }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isLocked) {
      setPinInput('');
      setErrorMsg('');
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleKeyPress = (num) => {
    if (pinInput.length < 6) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      setErrorMsg('');

      // Auto check when length reaches saved PIN length
      const savedPin = getSavedPin();
      if (savedPin && newPin.length === savedPin.length) {
        if (verifyPin(newPin)) {
          onUnlock();
        } else {
          setErrorMsg('PIN Salah! Silakan coba lagi.');
          setTimeout(() => setPinInput(''), 400);
        }
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      userSelect: 'none'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 1.5rem',
        maxWidth: '380px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)'
      }}>
        
        {/* Lock Icon Header */}
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          background: 'rgba(37, 99, 235, 0.15)',
          border: '1px solid var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <Lock size={26} color="var(--accent-light)" />
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#fff' }}>
          Aplikasi Terkunci
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 1.5rem 0' }}>
          Masukkan 4-digit PIN Keamanan Anda untuk membuka Chronos Hub.
        </p>

        {/* PIN Dots Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          {[0, 1, 2, 3].map(idx => (
            <div 
              key={idx}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)',
                background: pinInput.length > idx ? 'var(--accent-primary)' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            />
          ))}
        </div>

        {errorMsg && (
          <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Number Pad Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.75rem', 
          maxWidth: '260px', 
          margin: '0 auto' 
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              style={{
                height: '52px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.1s ease'
              }}
            >
              {num}
            </button>
          ))}

          <div />
          
          <button
            onClick={() => handleKeyPress('0')}
            style={{
              height: '52px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            0
          </button>

          <button
            onClick={handleDelete}
            style={{
              height: '52px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Hapus"
          >
            <Delete size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}

// PIN Security Settings Modal
export function SecuritySettingsModal({ isOpen, onClose, onPinUpdated }) {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasPin(isPinEnabled());
      setNewPin('');
      setConfirmPin('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePin = (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setErrorMsg('PIN harus terdiri dari minimal 4 angka!');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN tidak cocok!');
      return;
    }

    savePin(newPin);
    if (onPinUpdated) onPinUpdated();
    onClose();
  };

  const handleRemovePin = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus PIN keamanan?')) {
      removePin();
      setHasPin(false);
      if (onPinUpdated) onPinUpdated();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '460px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={22} color="var(--accent-light)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              Keamanan PIN Privasi
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {hasPin ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.4)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={16} /> PIN Keamanan Saat Ini Aktif
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Aplikasi terkunci otomatis ketika dibuka atau saat layar berpindah.
            </p>
            <button onClick={handleRemovePin} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem', color: '#f87171' }}>
              Hapus PIN Keamanan
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              {hasPin ? 'GANTI 4-DIGIT PIN BARU' : 'BUAT 4-DIGIT PIN SEKURITAS'}
            </label>
            <input 
              type="password" 
              maxLength={6}
              placeholder="Contoh: 1234"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="input-field"
              style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
              KONFIRMASI PIN
            </label>
            <input 
              type="password" 
              maxLength={6}
              placeholder="Ketik ulang PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="input-field"
              style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}
              required
            />
          </div>

          {errorMsg && (
            <div style={{ color: '#f87171', fontSize: '0.78rem', fontWeight: 700 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Simpan PIN Keamanan
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
