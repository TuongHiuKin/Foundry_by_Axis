// Lưu token đăng nhập trong SecureStore (được mã hoá trên máy), không dùng AsyncStorage.
import * as SecureStore from 'expo-secure-store'

const KEY = 'foundry_token'

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(KEY)
  } catch {
    return null
  }
}

export const setToken = (token: string) => SecureStore.setItemAsync(KEY, token)

export const clearToken = () => SecureStore.deleteItemAsync(KEY)
