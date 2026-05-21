'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2Icon, FileSearchIcon, FileUpIcon, LinkIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { dealerService } from '@/modules/dealers/services/dealerService'
import type { Dealer } from '@/modules/dealers/types'
import { productService } from '@/modules/products/services/productService'
import type { Product } from '@/modules/products/types'
import { purchaseBillService } from '../services/purchaseBillService'
import { PurchaseBillStatus, type PurchaseBillItem, type PurchaseBillReview } from '../types'

type RowEdit = {
  rawProductName: string
  quantity: string
  mrp: string
  purchasePrice: string
  productId: string
}

export function PurchaseBillUpload() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [dealerId, setDealerId] = useState('')
  const [billNumber, setBillNumber] = useState('')
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [totalAmount, setTotalAmount] = useState('0')
  const [paidAmount, setPaidAmount] = useState('0')
  const [file, setFile] = useState<File | null>(null)
  const [review, setReview] = useState<PurchaseBillReview | null>(null)
  const [edits, setEdits] = useState<Record<string, RowEdit>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedItem = useMemo(
    () => review?.items.find(item => item.id === activeItemId) ?? null,
    [review, activeItemId]
  )

  const loadDealers = useCallback(async () => {
    try {
      const data = await dealerService.getAll()
      setDealers(data)
      setDealerId(current => current || data[0]?.id || '')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dealers.'))
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDealers() }, 0)
    return () => window.clearTimeout(timer)
  }, [loadDealers])

  useEffect(() => {
    if (!review) return
    const timer = window.setTimeout(() => {
      const next: Record<string, RowEdit> = {}
      for (const item of review.items) {
        next[item.id] = {
          rawProductName: item.rawProductName,
          quantity: String(item.quantity),
          mrp: item.mrp.toFixed(2),
          purchasePrice: item.purchasePrice.toFixed(2),
          productId: item.productId ?? '',
        }
      }
      setEdits(next)
      setActiveItemId(review.items.find(item => !item.isConfirmed)?.id ?? review.items[0]?.id ?? null)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [review])

  const searchProducts = useCallback(async () => {
    try {
      setProducts(await productService.search({ query: query || selectedItem?.rawProductName || undefined }))
    } catch (err) {
      setError(getErrorMessage(err, 'Product search failed.'))
    }
  }, [query, selectedItem])

  useEffect(() => {
    const timer = window.setTimeout(() => { void searchProducts() }, 250)
    return () => window.clearTimeout(timer)
  }, [searchProducts])

  const upload = async () => {
    if (!dealerId || !file) {
      setError('Choose a dealer and PDF file first.')
      return
    }

    await runBusy(async () => {
      const data = await purchaseBillService.upload({
        dealerId,
        billNumber: billNumber || null,
        billDate,
        totalAmount: toNumber(totalAmount),
        paidAmount: toNumber(paidAmount),
        file,
      })
      setReview(data)
    })
  }

  const updateEdit = (itemId: string, patch: Partial<RowEdit>) => {
    setEdits(current => ({ ...current, [itemId]: { ...current[itemId], ...patch } }))
  }

  const mapItem = async (product: Product) => {
    if (!review || !selectedItem) return

    await runBusy(async () => {
      const mapped = await purchaseBillService.mapItem(review.id, {
        purchaseBillItemId: selectedItem.id,
        productId: product.id,
      })
      replaceItem(mapped)
      updateEdit(selectedItem.id, { productId: product.id })
    })
  }

  const createProduct = async () => {
    if (!review || !selectedItem) return
    const edit = edits[selectedItem.id]
    if (!edit?.rawProductName.trim()) return

    await runBusy(async () => {
      const mapped = await purchaseBillService.createProductFromItem(review.id, {
        purchaseBillItemId: selectedItem.id,
        productName: edit.rawProductName.trim(),
        minimumStockQuantity: 0,
      })
      replaceItem(mapped)
      updateEdit(selectedItem.id, { productId: mapped.productId ?? '' })
    })
  }

  const confirm = async () => {
    if (!review) return

    const items = review.items.map(item => {
      const edit = edits[item.id]
      return {
        purchaseBillItemId: item.id,
        productId: edit?.productId ?? '',
        rawProductName: edit?.rawProductName?.trim() || item.rawProductName,
        quantity: Number.parseInt(edit?.quantity ?? String(item.quantity), 10),
        mrp: toNumber(edit?.mrp ?? String(item.mrp)),
        purchasePrice: toNumber(edit?.purchasePrice ?? String(item.purchasePrice)),
      }
    })

    if (items.some(item => !item.productId || !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      setError('Every row needs a mapped product and valid quantity before confirmation.')
      return
    }

    await runBusy(async () => {
      setReview(await purchaseBillService.confirm(review.id, { paidAmount: toNumber(paidAmount), items }))
    })
  }

  const replaceItem = (mapped: PurchaseBillItem) => {
    setReview(current => current
      ? { ...current, items: current.items.map(item => item.id === mapped.id ? mapped : item) }
      : current)
  }

  const runBusy = async (work: () => Promise<void>) => {
    try {
      setBusy(true)
      setError(null)
      await work()
    } catch (err) {
      setError(getErrorMessage(err, 'Purchase bill action failed.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Bills</h1>
          <p className="text-sm text-muted-foreground">Upload dealer PDFs, review extracted items, map products, and create batches</p>
        </div>
        {review && (
          <Badge variant={isConfirmed(review.status) ? 'secondary' : 'outline'}>
            {isConfirmed(review.status) ? 'Confirmed' : 'Review pending'}
          </Badge>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUpIcon className="h-4 w-4" />
            Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
          <select value={dealerId} onChange={event => setDealerId(event.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
            {dealers.map(dealer => <option key={dealer.id} value={dealer.id}>{dealer.name}</option>)}
          </select>
          <Input value={billNumber} onChange={event => setBillNumber(event.target.value)} placeholder="Bill number" />
          <Input type="date" value={billDate} onChange={event => setBillDate(event.target.value)} />
          <Input value={totalAmount} onChange={event => setTotalAmount(event.target.value)} placeholder="Total" />
          <Input value={paidAmount} onChange={event => setPaidAmount(event.target.value)} placeholder="Paid" />
          <div className="flex gap-2">
            <Input type="file" accept="application/pdf,.pdf,.txt" onChange={event => setFile(event.target.files?.[0] ?? null)} className="w-48" />
            <Button onClick={upload} disabled={busy || !file || !dealerId}>
              <FileSearchIcon className="h-4 w-4" />
              Extract
            </Button>
          </div>
        </CardContent>
      </Card>

      {review && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
          <ReviewTable review={review} edits={edits} activeItemId={activeItemId} onActiveItem={setActiveItemId} onEdit={updateEdit} />
          <MappingPanel
            item={selectedItem}
            edit={selectedItem ? edits[selectedItem.id] : undefined}
            query={query}
            products={products}
            busy={busy}
            onQueryChange={setQuery}
            onMap={mapItem}
            onCreateProduct={createProduct}
            onConfirm={confirm}
            confirmed={isConfirmed(review.status)}
          />
        </div>
      )}
    </div>
  )
}

function ReviewTable({
  review,
  edits,
  activeItemId,
  onActiveItem,
  onEdit,
}: {
  review: PurchaseBillReview
  edits: Record<string, RowEdit>
  activeItemId: string | null
  onActiveItem: (id: string) => void
  onEdit: (itemId: string, patch: Partial<RowEdit>) => void
}) {
  return (
    <div className="rounded-md border">
      <div className="flex flex-col gap-1 border-b bg-muted/50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-medium">{review.billNumber} - {review.dealerName}</div>
          <div className="text-sm text-muted-foreground">Rs. {review.totalAmount.toFixed(2)} total</div>
        </div>
        <div className="text-xs text-muted-foreground">{review.extractionStatus}</div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background">
              <th className="px-3 py-2 text-left font-medium">Item</th>
              <th className="w-20 px-2 py-2 text-right font-medium">Qty</th>
              <th className="w-28 px-2 py-2 text-right font-medium">MRP</th>
              <th className="w-28 px-2 py-2 text-right font-medium">Buy</th>
              <th className="w-40 px-3 py-2 text-left font-medium">Mapping</th>
            </tr>
          </thead>
          <tbody>
            {review.items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No item lines were extracted. Scanned PDFs need OCR/manual entry next.</td></tr>
            ) : review.items.map(item => {
              const edit = edits[item.id]
              return (
                <tr key={item.id} onClick={() => onActiveItem(item.id)} className={`border-t hover:bg-muted/30 ${activeItemId === item.id ? 'bg-muted/40' : ''}`}>
                  <td className="px-3 py-2">
                    <Input value={edit?.rawProductName ?? item.rawProductName} onChange={event => onEdit(item.id, { rawProductName: event.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <Input value={edit?.quantity ?? String(item.quantity)} onChange={event => onEdit(item.id, { quantity: event.target.value })} className="text-right" />
                  </td>
                  <td className="px-2 py-2">
                    <Input value={edit?.mrp ?? item.mrp.toFixed(2)} onChange={event => onEdit(item.id, { mrp: event.target.value })} className="text-right" />
                  </td>
                  <td className="px-2 py-2">
                    <Input value={edit?.purchasePrice ?? item.purchasePrice.toFixed(2)} onChange={event => onEdit(item.id, { purchasePrice: event.target.value })} className="text-right" />
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={edit?.productId ? 'secondary' : 'outline'}>
                      {item.productName ?? (item.suggestedProductId ? 'Suggested' : 'Needs map')}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MappingPanel({
  item,
  edit,
  query,
  products,
  busy,
  onQueryChange,
  onMap,
  onCreateProduct,
  onConfirm,
  confirmed,
}: {
  item: PurchaseBillItem | null
  edit?: RowEdit
  query: string
  products: Product[]
  busy: boolean
  onQueryChange: (value: string) => void
  onMap: (product: Product) => Promise<void>
  onCreateProduct: () => Promise<void>
  onConfirm: () => Promise<void>
  confirmed: boolean
}) {
  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Product Mapping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {item ? (
            <>
              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium">{edit?.rawProductName || item.rawProductName}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Qty {edit?.quantity ?? item.quantity} - MRP Rs. {edit?.mrp ?? item.mrp.toFixed(2)} - Buy Rs. {edit?.purchasePrice ?? item.purchasePrice.toFixed(2)}
                </div>
              </div>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={event => onQueryChange(event.target.value)} className="pl-8" placeholder="Search product to map" />
              </div>
              <div className="max-h-72 overflow-auto rounded-md border">
                {products.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">No products found.</div>
                ) : products.map(product => (
                  <button key={product.id} type="button" onClick={() => void onMap(product)} className="block w-full border-b px-3 py-3 text-left text-sm last:border-b-0 hover:bg-muted/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{product.productName}</span>
                      <Badge variant="outline">Rs. {product.mrp.toFixed(0)}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{product.bikeModelName ?? product.categoryName ?? 'Product'}</div>
                  </button>
                ))}
              </div>
              <Button variant="outline" onClick={onCreateProduct} disabled={busy || confirmed} className="w-full">
                <PlusIcon className="h-4 w-4" />
                Create Product From Row
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select an extracted row to map it.</p>
          )}
        </CardContent>
      </Card>

      <Button onClick={onConfirm} disabled={busy || confirmed} className="w-full">
        <CheckCircle2Icon className="h-4 w-4" />
        Confirm Bill and Create Batches
      </Button>
    </div>
  )
}

function toNumber(value: string) {
  const number = Number.parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

function isConfirmed(status: PurchaseBillReview['status']) {
  return status === PurchaseBillStatus.Confirmed || status === 'Confirmed'
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
