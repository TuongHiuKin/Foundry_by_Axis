import { useCallback, useRef, useState } from 'react'
import { Alert, Image, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import FeedbackForm from '@/components/feedback-form'
import ReportBox, { type ReportTarget } from '@/components/report-box'
import { Button, Card, ErrorView, Loading, colors, styles } from '@/components/ui'
import { api, splitTags, type Feedback, type Product } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useApi } from '@/lib/use-api'

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const product = useApi<Product>(`/products/${id}`)
  const feedbacks = useApi<Feedback[]>(`/products/${id}/feedbacks`)
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null)

  // Quay lại từ màn "Sửa" thì tải lại sản phẩm (bỏ qua lần mở đầu vì đã tải rồi).
  const firstFocus = useRef(true)
  const reloadProduct = product.reload
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) firstFocus.current = false
      else reloadProduct()
    }, [reloadProduct]),
  )

  if (product.loading && !product.data) return <Loading />
  if (product.error || !product.data) return <ErrorView message={product.error || 'Không tìm thấy sản phẩm'} onRetry={product.reload} />

  const p = product.data
  const isOwner = !!user && (user.id === p.author_id || user.role === 'admin')
  const list = feedbacks.data ?? []

  function confirmDelete() {
    const doDelete = async () => {
      try {
        await api(`/products/${id}`, { method: 'DELETE' })
        router.replace('/dashboard')
      } catch (e) {
        Alert.alert('Không xoá được', (e as Error).message)
      }
    }
    if (Platform.OS === 'web') {
      doDelete()
      return
    }
    Alert.alert('Xoá sản phẩm?', 'Sản phẩm và các góp ý sẽ bị xoá vĩnh viễn.', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: doDelete },
    ])
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: p.title }} />
      {p.image_url ? (
        <Image source={{ uri: p.image_url }} style={{ width: '100%', height: 200, borderRadius: 12 }} resizeMode="cover" />
      ) : null}
      <Text style={styles.title}>{p.title}</Text>
      <Text style={[styles.muted, { textAlign: 'left' }]}>
        bởi {p.author_name} · {p.views} lượt xem · ★ {p.avg_rating.toFixed(1)}
      </Text>
      <View style={styles.row}>
        {splitTags(p.tags).map((t) => (
          <Text key={t} style={{ color: colors.primary, fontWeight: '600' }}>#{t}</Text>
        ))}
      </View>
      {p.description ? <Text style={styles.text}>{p.description}</Text> : null}

      {p.link ? <Button title="Dùng thử" onPress={() => Linking.openURL(p.link)} /> : null}
      {isOwner && (
        <View style={[styles.row, { flexWrap: 'nowrap' }]}>
          <View style={{ flex: 1 }}>
            <Button
              title="Sửa"
              variant="ghost"
              onPress={() => router.push({ pathname: '/products/[id]/edit', params: { id: String(p.id) } })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Xoá" variant="ghost" onPress={confirmDelete} />
          </View>
        </View>
      )}
      {user && !isOwner && (
        <Button title="Báo cáo sản phẩm" variant="ghost" onPress={() => setReportTarget({ product_id: p.id })} />
      )}
      {reportTarget && <ReportBox target={reportTarget} onClose={() => setReportTarget(null)} />}

      <Text style={styles.h2}>Góp ý ({list.length})</Text>
      {user ? (
        <FeedbackForm productId={p.id} onSent={() => { feedbacks.reload(); product.reload() }} />
      ) : (
        <Card>
          <Text style={styles.muted}>Đăng nhập để góp ý cho sản phẩm này.</Text>
          <Button title="Đăng nhập" variant="ghost" onPress={() => router.push('/login')} />
        </Card>
      )}

      {feedbacks.error ? <Text style={styles.error}>{feedbacks.error}</Text> : null}
      {!feedbacks.loading && list.length === 0 && <Text style={styles.muted}>Chưa có góp ý nào. Hãy là người đầu tiên!</Text>}
      {list.map((f) => (
        <Card key={f.id}>
          <View style={[styles.row, styles.between]}>
            <Text style={{ fontWeight: '700', color: colors.text }}>{f.user_name}</Text>
            <Text style={[styles.muted, styles.small]}>{'★'.repeat(f.rating)} · {f.section}</Text>
          </View>
          <Text style={styles.text}>{f.content}</Text>
          {user && (
            <Pressable accessibilityRole="button" onPress={() => setReportTarget({ feedback_id: f.id })} hitSlop={8}>
              <Text style={[styles.small, { color: colors.muted, textDecorationLine: 'underline' }]}>Báo cáo góp ý này</Text>
            </Pressable>
          )}
        </Card>
      ))}
    </ScrollView>
  )
}
