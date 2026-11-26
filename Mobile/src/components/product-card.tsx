import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { splitTags, type Product } from '@/lib/api'
import { colors, styles as ui } from './ui'

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem ${p.title}`}
      onPress={() => router.push({ pathname: '/products/[id]', params: { id: String(p.id) } })}
      style={({ pressed }) => [ui.card, styles.card, pressed && { opacity: 0.8 }]}
    >
      {p.image_url ? (
        <Image source={{ uri: p.image_url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>{p.title.slice(0, 1).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{p.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{p.description || 'Chưa có mô tả'}</Text>
        <Text style={styles.meta}>
          bởi {p.author_name} · ★ {p.avg_rating.toFixed(1)} · {p.feedback_count} góp ý
        </Text>
        <View style={ui.row}>
          {splitTags(p.tags).map((t) => (
            <Text key={t} style={styles.tag}>#{t}</Text>
          ))}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 12 },
  image: { width: 76, height: 76, borderRadius: 10, backgroundColor: colors.primarySoft },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 28, fontWeight: '800', color: colors.primary },
  body: { flex: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  desc: { fontSize: 13, color: colors.muted },
  meta: { fontSize: 12, color: colors.muted },
  tag: { fontSize: 12, color: colors.primary, fontWeight: '600' },
})
