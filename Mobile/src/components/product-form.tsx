import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native'
import { Button, Field, styles } from './ui'

export type ProductInput = {
  title: string
  description: string
  link: string
  image_url: string
  tags: string
}

export const emptyProduct: ProductInput = { title: '', description: '', link: '', image_url: '', tags: '' }

// Kiểm tra trước khi gửi, trả về câu lỗi tiếng Việt hoặc '' nếu hợp lệ.
export function validateProduct(p: ProductInput) {
  if (!p.title.trim()) return 'Tên sản phẩm là bắt buộc'
  for (const url of [p.link, p.image_url]) {
    if (url.trim() && !/^https?:\/\//i.test(url.trim())) return 'Link phải bắt đầu bằng http:// hoặc https://'
  }
  return ''
}

// Chuẩn hoá trước khi gửi: bỏ khoảng trắng thừa, tag viết thường, ngăn bằng dấu phẩy.
export function cleanProduct(p: ProductInput): ProductInput {
  return {
    title: p.title.trim(),
    description: p.description.trim(),
    link: p.link.trim(),
    image_url: p.image_url.trim(),
    tags: p.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).join(','),
  }
}

type Props = {
  initial: ProductInput
  submitLabel: string
  onSubmit: (p: ProductInput) => Promise<void>
}

export default function ProductForm({ initial, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const set = (key: keyof ProductInput) => (value: string) => setForm({ ...form, [key]: value })

  async function submit() {
    const problem = validateProduct(form)
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setSending(true)
    try {
      await onSubmit(cleanProduct(form))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Tên sản phẩm" value={form.title} onChangeText={set('title')} placeholder="Ví dụ: Ứng dụng học từ vựng" />
        <Field label="Mô tả" value={form.description} onChangeText={set('description')} multiline placeholder="Sản phẩm làm gì, muốn được góp ý phần nào?" />
        <Field label="Link dùng thử" value={form.link} onChangeText={set('link')} autoCapitalize="none" keyboardType="url" placeholder="https://..." />
        <Field label="Link ảnh" value={form.image_url} onChangeText={set('image_url')} autoCapitalize="none" keyboardType="url" placeholder="https://.../anh.png" />
        <Field label="Tag (ngăn bằng dấu phẩy)" value={form.tags} onChangeText={set('tags')} autoCapitalize="none" placeholder="web,ai" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={submitLabel} onPress={submit} loading={sending} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
