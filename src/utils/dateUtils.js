// Date & Time Utility Functions for 24-Hour Time & DD/MM/YYYY Format

// Format YYYY-MM-DD to DD/MM/YYYY
export function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

// Format YYYY-MM-DD to Long Indonesian Format e.g., "22 Juli 2026"
export function formatDateIndonesian(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, monthStr, dayStr] = parts;
    const dateObj = new Date(parseInt(year), parseInt(monthStr) - 1, parseInt(dayStr));
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return dateStr;
}

// Convert Date object to YYYY-MM-DD
export function toYYYYMMDD(dateObj) {
  const d = dateObj || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate 24-hour time options for dropdown select (00:00 to 23:30 in 15/30 min intervals)
export const HOURS_24_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  const hh = String(h).padStart(2, '0');
  HOURS_24_OPTIONS.push(`${hh}:00`);
  HOURS_24_OPTIONS.push(`${hh}:15`);
  HOURS_24_OPTIONS.push(`${hh}:30`);
  HOURS_24_OPTIONS.push(`${hh}:45`);
}
