import * as SecureStore from 'expo-secure-store';

/**
 * Penyimpanan token autentikasi memakai Expo SecureStore (Keystore di
 * Android, Keychain di iOS). Jangan pernah console.log isi token di sini
 * atau di tempat lain manapun.
 */
const TOKEN_KEY = 'auth_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
