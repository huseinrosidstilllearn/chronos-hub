// Web Audio Synthesizer Engine for Notification Ringtones & Alerts
// Zero external file dependency - 100% reliable offline sound synthesis

export const SOUND_OPTIONS = [
  { id: 'bell', name: '🔔 Standard Bell', type: 'chime' },
  { id: 'digital', name: '📱 Digital Chime', type: 'digital' },
  { id: 'harp', name: '🎵 Gentle Harp', type: 'harp' },
  { id: 'alarm', name: '🚨 Loud Alarm', type: 'alarm' },
  { id: 'radar', name: '📡 Radar Pulse', type: 'radar' }
];

export function playNotificationSound(soundId = 'bell') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;

    switch (soundId) {
      case 'digital': {
        // Digital double beep
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.setValueAtTime(1760, now + 0.1); // A6
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.25);
        break;
      }

      case 'harp': {
        // Gentle chord arpeggio (C Major)
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.6);
        });
        break;
      }

      case 'alarm': {
        // Loud warning pulse
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.15;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(900, start);
          gain.gain.setValueAtTime(0.35, start);
          gain.gain.exponentialRampToValueAtTime(0.01, start + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.12);
        }
        break;
      }

      case 'radar': {
        // Pulse ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      case 'bell':
      default: {
        // Standard Bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
    }
  } catch (e) {
    console.log('Audio playback error:', e);
  }
}
