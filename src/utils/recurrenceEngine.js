// Google Calendar Style Real Recurrence Engine
// Dynamically evaluates if a recurring event falls on a specific date string (YYYY-MM-DD)

// Safely parse YYYY-MM-DD string into a local Date object without UTC timezone shifting
function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

export function isEventOccurringOnDate(event, targetDateStr) {
  if (!event || !event.date || !targetDateStr) return false;

  const eventStartDate = event.date;
  const eventEndDate = event.endDate || event.date;

  // Target date cannot be before event start date
  if (targetDateStr < eventStartDate) return false;

  const rule = event.recurrence || 'none';

  // Handle Multi-day connected events (if no recurrence)
  if (rule === 'none') {
    return targetDateStr >= eventStartDate && targetDateStr <= eventEndDate;
  }

  // Handle Recurrence Rules with safe local date parsing
  const targetDateObj = parseLocalDate(targetDateStr);
  const startDateObj = parseLocalDate(eventStartDate);

  switch (rule) {
    case 'daily':
      // Repeats every single day after start date
      return true;

    case 'weekday':
      // Repeats every weekday (Monday = 1 to Friday = 5)
      const dayOfWeek = targetDateObj.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case 'weekly':
      // Repeats every week on the exact same day of week (e.g. Every Wednesday)
      return targetDateObj.getDay() === startDateObj.getDay();

    case 'monthly':
      // Repeats every month on the exact same day of month (e.g. Every 22nd)
      return targetDateObj.getDate() === startDateObj.getDate();

    case 'yearly':
      // Repeats every year on the exact same date & month (e.g. Every 22 July)
      return targetDateObj.getMonth() === startDateObj.getMonth() && 
             targetDateObj.getDate() === startDateObj.getDate();

    default:
      return targetDateStr === eventStartDate;
  }
}

// Generate dynamic display label for Google Calendar style dropdown
export function getRecurrenceLabel(rule, startDateStr) {
  if (!startDateStr) return 'Tidak berulang';
  
  const d = parseLocalDate(startDateStr);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = dayNames[d.getDay()];
  const dayNum = d.getDate();
  const monthName = monthNames[d.getMonth()];

  switch (rule) {
    case 'daily':
      return 'Harian (Setiap Hari)';
    case 'weekday':
      return 'Setiap hari kerja (Senin sampai Jumat)';
    case 'weekly':
      return `Mingguan pada hari ${dayName}`;
    case 'monthly':
      return `Bulanan pada tanggal ${dayNum}`;
    case 'yearly':
      return `Tiap tahun pada ${dayNum} ${monthName}`;
    case 'none':
    default:
      return 'Tidak berulang';
  }
}
