import { cleanProduct, emptyProduct, validateProduct } from '@/components/product-form'

describe('validateProduct', () => {
  it('requires a title', () => {
    expect(validateProduct({ ...emptyProduct, title: '   ' })).toBe('Tên sản phẩm là bắt buộc')
  })

  it('rejects links without http(s)', () => {
    expect(validateProduct({ ...emptyProduct, title: 'A', link: 'foundry.vn' })).toMatch(/http/)
    expect(validateProduct({ ...emptyProduct, title: 'A', image_url: 'ftp://x' })).toMatch(/http/)
  })

  it('accepts a valid product', () => {
    expect(validateProduct({ ...emptyProduct, title: 'A', link: 'https://a.vn', image_url: 'http://b.vn/x.png' })).toBe('')
  })
})

describe('cleanProduct', () => {
  it('trims fields and normalizes tags', () => {
    expect(
      cleanProduct({ title: ' App ', description: ' mô tả ', link: ' https://a.vn ', image_url: '', tags: ' Web, AI ,, game' }),
    ).toEqual({ title: 'App', description: 'mô tả', link: 'https://a.vn', image_url: '', tags: 'web,ai,game' })
  })
})
