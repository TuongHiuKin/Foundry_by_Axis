import { useEffect, useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native'
import { Stack, router } from 'expo-router'
import ProductCard from '@/components/product-card'
import { Chip, Empty, ErrorView, Loading, colors, styles } from '@/components/ui'
import { TAGS, productsPath, type Product } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useApi } from '@/lib/use-api'

export default function Home() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [path, setPath] = useState(productsPath('', ''))
  const { data, error, loading, reload } = useApi<Product[]>(path)

  // Đợi người dùng gõ xong 400ms rồi mới tìm, đỡ gọi API liên tục.
  useEffect(() => {
    const timer = setTimeout(() => setPath(productsPath(q, tag)), 400)
    return () => clearTimeout(timer)
  }, [q, tag])

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(user ? '/dashboard' : '/login')}
              hitSlop={10}
            >
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{user ? 'Tài khoản' : 'Đăng nhập'}</Text>
            </Pressable>
          ),
        }}
      />
      <View style={[styles.content, { paddingBottom: 4 }]}>
        <TextInput
          accessibilityLabel="Tìm sản phẩm"
          placeholder="Tìm sản phẩm..."
          placeholderTextColor={colors.muted}
          value={q}
          onChangeText={setQ}
          style={styles.input}
          returnKeyType="search"
        />
        <View style={styles.row}>
          <Chip label="Tất cả" active={tag === ''} onPress={() => setTag('')} />
          {TAGS.map((t) => (
            <Chip key={t} label={`#${t}`} active={tag === t} onPress={() => setTag(t)} />
          ))}
        </View>
      </View>

      {loading && !data ? (
        <Loading />
      ) : error && !data ? (
        <ErrorView message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <ProductCard p={item} />}
          contentContainerStyle={[styles.content, { flexGrow: 1 }]}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} colors={[colors.primary]} />}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : undefined}
          ListEmptyComponent={<Empty text="Chưa có sản phẩm nào." />}
        />
      )}

      {user && (
        <View style={{ padding: 16 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/products/new')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>+ Đăng sản phẩm</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
