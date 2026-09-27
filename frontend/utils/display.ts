export const NOT_PROVIDED = 'Not provided';

export function formatDisplayValue(value: unknown) {
  if (value === null || value === undefined) return NOT_PROVIDED;
  if (typeof value === 'string' && value.trim() === '') return NOT_PROVIDED;
  if (Array.isArray(value) && value.length === 0) return NOT_PROVIDED;
  return String(value);
}

export function formatEnumValue(value?: string | null) {
  const displayValue = formatDisplayValue(value);
  if (displayValue === NOT_PROVIDED) return displayValue;
  return displayValue.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDateValue(value?: string | null, precision?: string | null) {
  if (!value || Number.isNaN(new Date(value).getTime())) return NOT_PROVIDED;
  const date = new Date(value);
  if (precision === 'YEAR_ONLY') return String(date.getUTCFullYear());
  if (precision === 'APPROXIMATE') return `Around ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)}`;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}

export function formatDateTimeValue(value?: string | null) {
  if (!value || Number.isNaN(new Date(value).getTime())) return NOT_PROVIDED;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
