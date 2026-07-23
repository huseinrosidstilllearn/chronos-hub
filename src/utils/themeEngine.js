// 15 Preset Themes + Custom HEX Color Engine

export const THEME_PRESETS = [
  { id: 'royal_blue', name: 'Royal Blue', hex: '#2563eb' },
  { id: 'sky_cyan', name: 'Sky Cyan', hex: '#0284c7' },
  { id: 'emerald_green', name: 'Emerald Green', hex: '#10b981' },
  { id: 'teal_aqua', name: 'Teal Aqua', hex: '#0d9488' },
  { id: 'indigo_night', name: 'Indigo Night', hex: '#4f46e5' },
  { id: 'cyber_violet', name: 'Cyber Violet', hex: '#8b5cf6' },
  { id: 'neon_magenta', name: 'Neon Magenta', hex: '#d946ef' },
  { id: 'crimson_rose', name: 'Crimson Rose', hex: '#e11d48' },
  { id: 'sunset_coral', name: 'Sunset Coral', hex: '#f97316' },
  { id: 'amber_gold', name: 'Amber Gold', hex: '#d97706' },
  { id: 'lime_mint', name: 'Lime Mint', hex: '#65a30d' },
  { id: 'electric_purple', name: 'Electric Purple', hex: '#9333ea' },
  { id: 'cobalt_navy', name: 'Cobalt Navy', hex: '#1d4ed8' },
  { id: 'deep_slate', name: 'Deep Slate', hex: '#475569' },
  { id: 'midnight_blue', name: 'Midnight Blue', hex: '#1e3a8a' }
];

export function applyCustomHexTheme(hexCode) {
  if (!hexCode) return;
  let cleanHex = hexCode.trim();
  if (!cleanHex.startsWith('#')) cleanHex = `#${cleanHex}`;

  // Simple HEX validation
  if (!/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) return;

  const root = document.documentElement;
  root.style.setProperty('--accent-primary', cleanHex);
  root.style.setProperty('--border-glow', cleanHex);
  root.style.setProperty('--accent-light', cleanHex);
  root.style.setProperty('--accent-secondary', cleanHex);
}
