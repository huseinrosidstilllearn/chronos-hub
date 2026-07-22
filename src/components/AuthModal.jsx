import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User, AlertCircle, Check, Flame } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle, getSavedFirebaseConfig } from '../services/firebaseService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onOpenFirebaseModal }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const hasConfig = !!getSavedFirebaseConfig();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const userCred = await loginWithEmail(email, password);
        if (onAuthSuccess) onAuthSuccess(userCred.user);
        onClose();
      } else {
        const userCred = await registerWithEmail(email, password, displayName);
        if (onAuthSuccess) onAuthSuccess(userCred.user);
        onClose();
      }
    } catch (err) {
      console.error('Auth Error:', err);
      let msg = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Email atau password tidak ditemukan / salah!';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar. Silakan login.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password terlalu lemah! Gunakan minimal 6 karakter.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const userCred = await loginWithGoogle();
      if (onAuthSuccess) onAuthSuccess(userCred.user);
      onClose();
    } catch (err) {
      console.error('Google Auth Error:', err);
      setErrorMsg('Gagal login dengan Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '440px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '0.4rem', borderRadius: '8px' }}>
              <LogIn size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                Autentikasi Akun Firebase
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Data Anda terpisah aman & terisolasi khusus untuk akun Anda.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`btn ${tab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '0.45rem', fontSize: '0.85rem', border: 'none' }}
          >
            <LogIn size={15} /> Masuk (Login)
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            className={`btn ${tab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '0.45rem', fontSize: '0.85rem', border: 'none' }}
          >
            <UserPlus size={15} /> Buat Akun
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          
          {tab === 'register' && (
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                NAMA LENGKAP
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Husein Rosid"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                  required
                />
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
              ALAMAT EMAIL
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.4rem' }}
                required
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.4rem' }}
                required
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.6rem 0.85rem', borderRadius: '6px', color: '#f87171', fontSize: '0.78rem', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.6rem', marginTop: '0.3rem' }}
            disabled={loading}
          >
            {loading ? 'Memproses...' : (tab === 'login' ? 'Masuk ke Akun Saya' : 'Daftarkan Akun Baru')}
          </button>

        </form>

        <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.75rem', position: 'relative' }}>
          <span style={{ background: 'var(--bg-secondary)', padding: '0 0.5rem', position: 'relative', zIndex: 1 }}>atau</span>
          <div style={{ borderTop: '1px solid var(--border-color)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
        </div>

        {/* Google OAuth Login Button */}
        <button
          onClick={handleGoogleAuth}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Masuk dengan Google
        </button>

      </div>
    </div>
  );
}
