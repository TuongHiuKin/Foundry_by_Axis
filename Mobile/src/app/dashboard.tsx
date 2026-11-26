import { useCallback } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Redirect, router, useFocusEffect } from 'expo-router'
import { Button, Card, ErrorView, Loading, colors, styles } from '@/components/ui'
import type { DashboardData } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useApi } from '@/lib/use-api'

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const { data, error, loading, reload } = useApi<DashboardData>(user ? '/me/dashboard' : null)

  // Quay lại màn này (sau khi đăng/sửa/xoá) thì tải lại số liệu.
  useFocusEffect(
    useCallback(() => {
      reload()
    }, [reload]),
  )

  if (authLoading) return <Loading />
  if (!user) return <Redirect href="/login" />
  if (loading && !data) return <Loading />
  if (error && !data) return <ErrorView message={error} onRetry={reload} />

  const d = data!
  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={d.products}
      keyExtractor={(p) => String(p.id)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} colors={[colors.primary]} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <Text style={styles.title}>Xin chào, {user.name}</Text>
          <Text style={[styles.muted, { textAlign: 'left' }]}>{user.email}</Text>
          <View style={local.stats}>
            <Stat label="Sản phẩm" value={d.total_products} />
            <Stat label="Lượt xem" value={d.total_views} />
            <Stat label="Góp ý" value={d.total_feedbacks} />
          </View>
          <Button title="+ Đăng sản phẩm" onPress={() => router.push('/products/new')} />
          <Text style={styles.h2}>Sản phẩm của bạn</Text>
        </View>
      }
      renderItem={({ item: p }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/products/[id]', params: { id: String(p.id) } })}
        >
          <Card>
            <View style={[styles.row, styles.between]}>
              <Text style={{ fontWeight: '700', color: colors.text, flexShrink: 1 }}>{p.title}</Text>
              <Text style={[styles.small, { color: p.hidden ? colors.danger : colors.muted }]}>
                {p.hidden ? 'Bị ẩn' : 'Đang hiện'}
              </Text>
            </View>
            <Text style={[styles.muted, styles.small, { textAlign: 'left' }]}>
              {p.views} lượt xem · {p.feedback_count} góp ý · ★ {p.avg_rating.toFixed(1)}
            </Text>
          </Card>
        </Pressable>
      )}
      ListEmptyComponent={<Text style={styles.muted}>Bạn chưa đăng sản phẩm nào.</Text>}
      ListFooterComponent={
        <View style={{ marginTop: 16 }}>
          <Button
            title="Đăng xuất"
            variant="ghost"
            onPress={async () => {
              await logout()
              router.replace('/')
            }}
          />
        </View>
      }
    />
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={local.stat}>
      <Text style={local.statValue}>{value}</Text>
      <Text style={[styles.muted, styles.small]}>{label}</Text>
    </View>
  )
}

const local = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
})
