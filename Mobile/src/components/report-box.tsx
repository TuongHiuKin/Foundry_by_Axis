import { useState } from 'react'
import { Text, View } from 'react-native'
import { post } from '@/lib/api'
import { Button, Card, Field, styles } from './ui'

export type ReportTarget = { product_id?: number; feedback_id?: number }

// Ô báo cáo vi phạm (thay cho prompt() trên web vì Android không có).
export default function ReportBox({ target, onClose }: { target: ReportTarget; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  async function send() {
    if (!reason.trim()) {
      setMsg('Vui lòng nhập lý do')
      return
    }
    setSending(true)
    try {
      await post('/reports', { ...target, reason: reason.trim() })
      setSent(true)
      setMsg('Đã gửi báo cáo cho admin.')
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <Text style={styles.label}>{target.product_id ? 'Báo cáo sản phẩm' : 'Báo cáo góp ý'}</Text>
      {!sent && <Field label="Lý do báo cáo" value={reason} onChangeText={setReason} placeholder="Spam, nội dung xấu..." />}
      {msg ? <Text style={sent ? styles.muted : styles.error}>{msg}</Text> : null}
      <View style={[styles.row, { flexWrap: 'nowrap' }]}>
        {!sent && (
          <View style={{ flex: 1 }}>
            <Button title="Gửi báo cáo" onPress={send} loading={sending} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Button title={sent ? 'Đóng' : 'Huỷ'} variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Card>
  )
}
