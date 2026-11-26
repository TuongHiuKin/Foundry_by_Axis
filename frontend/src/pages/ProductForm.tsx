import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, post, type Product } from '../api'

// Dùng chung cho cả "Đăng sản phẩm mới" và "Sửa sản phẩm".
export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', link: '', image_url: '', tags: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api<Product>(`/products/${id}`).then((p) =>
      setForm({ title: p.title, description: p.description, link: p.link, image_url: p.image_url, tags: p.tags }),
    )
  }, [id])

  function set(field: keyof typeof form, value: string) {
    setForm({ ...form, [field]: value })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      if (id) {
        await api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(form) })
        navigate(`/products/${id}`)
      } else {
        const res = await post<{ id: number }>('/products', form)
        navigate(`/products/${res.id}`)
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form className="box form" onSubmit={submit}>
      <h1>{id ? 'Sửa sản phẩm' : 'Đăng sản phẩm mới'}</h1>
      <label>Tên sản phẩm<input required value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
      <label>Mô tả<textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
      <label>Link dùng thử<input placeholder="https://..." value={form.link} onChange={(e) => set('link', e.target.value)} /></label>
      <label>Link ảnh bìa<input placeholder="https://..." value={form.image_url} onChange={(e) => set('image_url', e.target.value)} /></label>
      <label>Thẻ (cách nhau bằng dấu phẩy)<input placeholder="web,ai" value={form.tags} onChange={(e) => set('tags', e.target.value)} /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn">{id ? 'Lưu' : 'Đăng'}</button>
    </form>
  )
}
