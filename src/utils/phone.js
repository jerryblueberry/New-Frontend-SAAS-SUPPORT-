// Phone utilities for Australian numbers (best practice: E.164 storage, local display)

export const digitsOnly = (value) => (String(value || '').match(/\d+/g) || []).join('');

// Convert input to E.164 (+61XXXXXXXXX), dropping local leading 0
export const toE164Au = (value) => {
  const raw = String(value || '').trim();
  let digits = digitsOnly(raw);
  if (raw.startsWith('+61')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('61')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 9);
  return digits ? `+61${digits}` : '';
};

// Validate AU mobile in E.164 (+614XXXXXXXX)
export const isValidAuMobile = (value) => {
  const e164 = toE164Au(value);
  return /^\+614\d{8}$/.test(e164);
};

// Validate AU phone (both mobile and landline) in E.164 format
// Mobile: +614XXXXXXXX (starts with 4)
// Landline: +612XXXXXXXX, +613XXXXXXXX, +617XXXXXXXX, +618XXXXXXXX (starts with 2, 3, 7, or 8)
export const isValidAuPhone = (value) => {
  if (!value || !value.trim()) return false;
  const e164 = toE164Au(value);
  if (!/^\+61\d{9}$/.test(e164)) return false;
  // First digit after +61 must be 2, 3, 4, 7, or 8
  const firstDigit = e164[3];
  return ['2', '3', '4', '7', '8'].includes(firstDigit);
};

// Format to local AU mobile display: 0412 345 678 (progressive spacing)
export const formatAuLocal = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let local = '';
  const m = raw.match(/^\+61(\d{0,9})$/);
  if (m) {
    local = '0' + m[1];
  } else {
    const d = digitsOnly(raw);
    if (d.startsWith('0')) local = d.slice(0, 10);
    else if (d.startsWith('61')) local = '0' + d.slice(2, 11);
    else local = d;
  }
  if (local.length <= 4) return local;
  if (local.length <= 7) return `${local.slice(0, 4)} ${local.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 10)}`.trim();
};

// Format to international AU display: +61 4xx xxx xxx (no leading 0)
export const formatAuInternational = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let digits = digitsOnly(raw);
  if (raw.startsWith('+61')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('61')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    // drop local leading 0 for international display
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 9);
  if (digits.length === 0) return '+61';
  if (digits.length <= 1) return `+61 ${digits}`;
  if (digits.length <= 4) return `+61 ${digits[0]}${digits.slice(1)}`;
  if (digits.length <= 7) return `+61 ${digits[0]}${digits.slice(1,4)} ${digits.slice(4)}`;
  return `+61 ${digits[0]}${digits.slice(1,4)} ${digits.slice(4,7)} ${digits.slice(7,9)}`.trim();
};


