import { useState } from 'react'
import { Text, View } from 'react-native'
import { SECTIONS, post } from '@/lib/api'
import { Button, Card, Chip, Field, styles } from './ui'

// Form góp ý: chọn mục, số sao, viết nội dung (ít nhất 5 ký tự, giống BE).
export default function FeedbackForm({ productId, onSent }: { productId: number; onSent: () => void }) {
  const [section, setSection] = useState('chung')
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)
  const [sending, setSending] = useState(false)

  async function send() {
    if (content.trim().length < 5) {
      setIsError(true)
      setMsg('Góp ý cần ít nhất 5 ký tự')
      return
    }
    setSending(true)
    setMsg('')
    try {
      await post(`/products/${productId}/feedbacks`, { section, rating, content: content.trim() })
      setContent('')
      setIsError(false)
      setMsg('Cảm ơn bạn đã góp ý!')
      onSent()
    } catch (e) {
      setIsError(true)
      setMsg((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <Text style={styles.label}>Mục</Text>
      <View style={styles.row}>
        {SECTIONS.map((s) => (
          <Chip key={s} label={s} active={section === s} onPress={() => setSection(s)} />
        ))}
      </View>
      <Text style={styles.label}>Đánh giá</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Chip key={n} label={`${n}★`} active={rating === n} onPress={() => setRating(n)} />
        ))}
      </View>
      <Field
        label="Nội dung góp ý"
        value={content}
        onChangeText={setContent}
        placeholder="Bạn thấy sản phẩm thế nào?"
        multiline
      />
      <Button title="Gửi góp ý" onPress={send} loading={sending} />
      {msg ? <Text style={isError ? styles.error : styles.muted}>{msg}</Text> : null}
    </Card>
  )
}
