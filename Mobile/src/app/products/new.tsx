import { Redirect, router } from 'expo-router'
import ProductForm, { emptyProduct } from '@/components/product-form'
import { Loading } from '@/components/ui'
import { post } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export default function NewProduct() {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Redirect href="/login" />

  return (
    <ProductForm
      initial={emptyProduct}
      submitLabel="Đăng sản phẩm"
      onSubmit={async (p) => {
        const res = await post<{ id: number }>('/products', p)
        router.replace({ pathname: '/products/[id]', params: { id: String(res.id) } })
      }}
    />
  )
}
