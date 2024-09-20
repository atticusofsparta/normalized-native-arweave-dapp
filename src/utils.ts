import { THEME_TYPES } from './constants';
import { sha256B64Url } from './services/encoding';

// for tailwind css, need the change the root
export const applyThemePreference = (theme: string) => {
  const { DARK, LIGHT } = THEME_TYPES;
  const root = window.document.documentElement;
  const isDark = theme === DARK;
  root.classList.remove(isDark ? LIGHT : DARK);
  root.classList.add(theme);
};

export function normalizeEthAddress(address: string) {
  const addressBuffer = Buffer.from(address.replace('0x', ''), 'hex');
  return sha256B64Url(addressBuffer);
}

export function normalizeSolanaAddress(address: string) {
  const addressBuffer = Buffer.from(address, 'base64');
  return sha256B64Url(addressBuffer);
}
