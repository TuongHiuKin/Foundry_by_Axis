import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { colors } from '@/components/ui'
import { AuthProvider } from '@/lib/auth'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: '700' },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Foundry' }} />
          <Stack.Screen name="login" options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="register" options={{ title: 'Đăng ký' }} />
          <Stack.Screen name="dashboard" options={{ title: 'Tài khoản' }} />
          <Stack.Screen name="products/new" options={{ title: 'Đăng sản phẩm' }} />
          <Stack.Screen name="products/[id]/index" options={{ title: 'Sản phẩm' }} />
          <Stack.Screen name="products/[id]/edit" options={{ title: 'Sửa sản phẩm' }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
