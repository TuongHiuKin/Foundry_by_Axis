import { Redirect, router, useLocalSearchParams } from 'expo-router'
import ProductForm from '@/components/product-form'
import { ErrorView, Loading } from '@/components/ui'
import { api, type Product } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useApi } from '@/lib/use-api'

export default function EditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const { data, error, loading, reload } = useApi<Product>(`/products/${id}`)

  if (authLoading || (loading && !data)) return <Loading />
  if (!user) return <Redirect href="/login" />
  if (error || !data) return <ErrorView message={error || 'Không tìm thấy sản phẩm'} onRetry={reload} />

  return (
    <ProductForm
      initial={{
        title: data.title,
        description: data.description,
        link: data.link,
        image_url: data.image_url,
        tags: data.tags,
      }}
      submitLabel="Lưu thay đổi"
      onSubmit={async (p) => {
        await api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(p) })
        router.back()
      }}
    />
  )
}
