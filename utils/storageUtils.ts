export const STORAGE_KEY_DISCONNECT_METAMASK = 'eth_lsd_disconnect_metamask';
export const STORAGE_KEY_LSD_TOKEN_NAME = 'lsd_token_name';
export const STORAGE_KEY_OWNER_ADDRESS = 'owner_address';

export function saveStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function getStorage(key: string): string | null {
  return localStorage.getItem(key);
}

export function removeStorage(key: string) {
  localStorage.removeItem(key);
}
