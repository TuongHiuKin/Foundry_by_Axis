// Giả lập SecureStore trong test (không có máy thật).
jest.mock('expo-secure-store', () => {
  let store = {}
  return {
    getItemAsync: jest.fn(async (k) => store[k] ?? null),
    setItemAsync: jest.fn(async (k, v) => {
      store[k] = v
    }),
    deleteItemAsync: jest.fn(async (k) => {
      delete store[k]
    }),
    __reset: () => {
      store = {}
    },
  }
})
