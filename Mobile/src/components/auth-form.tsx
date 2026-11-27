import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native'
import { Link, router } from 'expo-router'
import { post, type AuthResponse } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Button, Field, styles } from './ui'

// Màn đăng nhập và đăng ký dùng chung một form; đăng ký có thêm ô "Tên".
export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { saveLogin } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const isRegister = mode === 'register'

  async function submit() {
    setError('')
    setSending(true)
    try {
      const body = isRegister ? { name, email, password } : { email, password }
      const res = await post<AuthResponse>(isRegister ? '/auth/register' : '/auth/login', body)
      await saveLogin(res.token, res.user)
      // Quay về màn trước (thường là trang chủ hoặc chi tiết sản phẩm).
      if (router.canGoBack()) router.back()
      else router.replace('/')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</Text>
        {isRegister && <Field label="Tên" value={name} onChangeText={setName} placeholder="Tên hiển thị" />}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="ban@vidu.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          placeholder={isRegister ? 'Ít nhất 6 ký tự' : ''}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={isRegister ? 'Đăng ký' : 'Đăng nhập'} onPress={submit} loading={sending} />
        <Text style={styles.muted}>
          {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
          <Link replace href={isRegister ? '/login' : '/register'} style={{ color: '#ff6a3d', fontWeight: '700' }}>
            {isRegister ? 'Đăng nhập' : 'Đăng ký'}
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
