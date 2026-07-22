// App Security Engine & PIN Lock Service

export function getSavedPin() {
  return localStorage.getItem('chronos_pin_code') || null;
}

export function isPinEnabled() {
  return !!getSavedPin();
}

export function savePin(pinCode) {
  if (!pinCode || pinCode.length < 4) return false;
  localStorage.setItem('chronos_pin_code', pinCode);
  return true;
}

export function removePin() {
  localStorage.removeItem('chronos_pin_code');
  localStorage.removeItem('chronos_app_locked');
}

export function verifyPin(inputPin) {
  const savedPin = getSavedPin();
  if (!savedPin) return true;
  return savedPin === inputPin;
}
