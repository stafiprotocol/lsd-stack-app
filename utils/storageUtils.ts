export const STORAGE_KEY_DISCONNECT_METAMASK = "eth_lsd_disconnect_metamask";
export const STORAGE_KEY_LSD_TOKEN_NAME = "lsd_token_name";
export const STORAGE_KEY_OWNER_ADDRESS = "owner_address";
export const STORAGE_KEPLR_WALLET_ALLOWED = "lsd_stack_keplr_network_allowed_";

export function saveStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function getStorage(key: string): string | null {
  return localStorage.getItem(key);
}

export function removeStorage(key: string) {
  localStorage.removeItem(key);
}

export function saveCosmosNetworkAllowedFlag(chainId: string) {
  saveStorage(STORAGE_KEPLR_WALLET_ALLOWED + chainId, "1");
}

export function clearCosmosNetworkAllowedFlag(chainId: string) {
  removeStorage(STORAGE_KEPLR_WALLET_ALLOWED + chainId);
}

export function isCosmosNetworkAllowed(chainId: string) {
  return getStorage(STORAGE_KEPLR_WALLET_ALLOWED + chainId);
}
