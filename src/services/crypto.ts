import CryptoJS from 'crypto-js';

const SECRET_KEY = 'content-director-secret-key-2024';

export function encryptKey(key: string): string {
  if (!key) return '';
  return CryptoJS.AES.encrypt(key, SECRET_KEY).toString();
}

export function decryptKey(encrypted: string): string {
  if (!encrypted) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

export function maskKey(key: string): string {
  if (!key) return '';
  if (key.length < 8) return '****';
  return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}
