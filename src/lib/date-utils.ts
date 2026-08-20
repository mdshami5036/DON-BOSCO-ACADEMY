/**
 * Global Date Formatter for Don Bosco Academy
 * Enforces DD/MM/YYYY format across all views, tables, cards, templates and portals.
 */

export function formatDDMMYYYY(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';
  try {
    // If it's already in DD/MM/YYYY format
    if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput.trim())) {
      return dateInput.trim();
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      if (typeof dateInput === 'string') {
        const parts = dateInput.split(/[-/]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // YYYY-MM-DD -> DD/MM/YYYY
            return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
          }
          if (parts[2].length === 4) {
            return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
          }
        }
      }
      return String(dateInput);
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput || '');
  }
}

export function formatDDMMYYYYTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return formatDDMMYYYY(dateInput);
    const dateStr = formatDDMMYYYY(d);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${dateStr} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  } catch {
    return formatDDMMYYYY(dateInput);
  }
}

export function getTodayDDMMYYYY(): string {
  return formatDDMMYYYY(new Date());
}
