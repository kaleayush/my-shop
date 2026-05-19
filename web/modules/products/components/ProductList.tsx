'use client'

import { useCallback, useEffect, useState } from 'react'
import { ImageIcon, PackageIcon, PencilIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProductSheet } from './ProductSheet'
import { productService } from '../services/productService'
import type { Product, ProductDetail, ProductPayload, UpdateProductPayload } from '../types'

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<ProductDetail | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<ProductDetail | undefined>()
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const items = await productService.search({ query: query || undefined })
      setProducts(items)
    } catch {
      setError('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const handleAdd = () => {
    setEditing(undefined)
    setSheetOpen(true)
  }

  const handleEdit = async (product: Product) => {
    const detail = await productService.getById(product.id)
    setEditing(detail)
    setSheetOpen(true)
  }

  const handleSelect = async (product: Product) => {
    setSelected(await productService.getById(product.id))
    setImageUrl('')
  }

  const handleSubmit = async (values: ProductPayload | UpdateProductPayload) => {
    if (editing) {
      await productService.update(editing.id, values as UpdateProductPayload)
    } else {
      const created = await productService.create(values as ProductPayload)
      setSelected(created)
    }
    await load()
    if (editing) setSelected(await productService.getById(editing.id))
  }

  const handleAddImage = async () => {
    if (!selected || !imageUrl.trim()) return
    await productService.addImage(selected.id, { imageUrl: imageUrl.trim(), isPrimary: selected.images.length === 0 })
    setSelected(await productService.getById(selected.id))
    setImageUrl('')
    await load()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage product identity, search fields, images, and batch stock</p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <PlusIcon className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex max-w-xl items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={event => setQuery(event.target.value)} className="pl-8" placeholder="Search name, model, color, dealer" />
        </div>
        <Button variant="outline" onClick={load}>Search</Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.9fr)]">
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Product</th>
                <th className="px-4 py-2 text-left font-medium">Model</th>
                <th className="px-4 py-2 text-right font-medium">MRP</th>
                <th className="px-4 py-2 text-right font-medium">Available</th>
                <th className="w-20 px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No products found.</td></tr>
              ) : products.map(product => (
                <tr
                  key={product.id}
                  className="border-t transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleSelect(product)} className="text-left font-medium hover:underline">
                      {product.productName}
                    </button>
                    <div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">
                      {product.categoryName && <span>{product.categoryName}</span>}
                      {product.brandName && <span>{product.brandName}</span>}
                      {product.colorName && <span>{product.colorName}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{product.bikeModelName ?? product.bikeCompanyName ?? '-'}</td>
                  <td className="px-4 py-3 text-right">Rs. {product.mrp.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={product.availableQuantity <= product.minimumStockQuantity ? 'destructive' : 'secondary'}>
                      {product.availableQuantity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(product)}>
                      <PencilIcon className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ProductDetailPanel
          product={selected}
          imageUrl={imageUrl}
          onImageUrlChange={setImageUrl}
          onAddImage={handleAddImage}
        />
      </div>

      <ProductSheet open={sheetOpen} onOpenChange={setSheetOpen} product={editing} onSubmit={handleSubmit} />
    </div>
  )
}

function ProductDetailPanel({
  product,
  imageUrl,
  onImageUrlChange,
  onAddImage,
}: {
  product: ProductDetail | null
  imageUrl: string
  onImageUrlChange: (value: string) => void
  onAddImage: () => Promise<void>
}) {
  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PackageIcon className="h-4 w-4" />
            Product Detail
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Select a product to inspect stock batches and images.</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{product.productName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Metric label="Total" value={product.totalQuantity} />
          <Metric label="Reserved" value={product.reservedQuantity} />
          <Metric label="Available" value={product.availableQuantity} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="h-4 w-4" />
            Images
          </div>
          {product.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {product.images.slice(0, 3).map(image => (
                <div key={image.id} className="aspect-square overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.imageUrl} alt={product.productName} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input value={imageUrl} onChange={event => onImageUrlChange(event.target.value)} placeholder="Image URL" />
            <Button variant="outline" onClick={onAddImage}>Add</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-medium">Dealer batches</h2>
          {product.batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stock batches yet.</p>
          ) : (
            <div className="space-y-2">
              {product.batches.map(batch => (
                <div key={batch.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{batch.dealerName}</span>
                    <Badge variant={batch.isLowStock ? 'destructive' : 'secondary'}>{batch.availableQuantity} available</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-muted-foreground">
                    <span>{batch.batchNumber}</span>
                    <span className="text-right">Code {batch.purchasePriceCode}</span>
                    <span>MRP Rs. {batch.mrp.toFixed(2)}</span>
                    <span className="text-right">
                      {batch.purchasePrice == null ? 'Staff hidden' : `Buy Rs. ${batch.purchasePrice.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
