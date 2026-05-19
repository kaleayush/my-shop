'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2Icon,
  CreditCardIcon,
  FilePlus2Icon,
  PauseIcon,
  SearchIcon,
  ShoppingCartIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { productService, inventoryService } from '@/modules/products/services/productService'
import type { InventoryBatch, Product } from '@/modules/products/types'
import { posService } from '../services/posService'
import { PaymentMode, type DraftSale, type DraftSaleItem, type Sale } from '../types'

interface ItemEdit {
  quantity: string
  sellingPrice: string
}

export function PosBilling() {
  const [drafts, setDrafts] = useState<DraftSale[]>([])
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [batches, setBatches] = useState<InventoryBatch[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null)
  const [query, setQuery] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [addQuantity, setAddQuantity] = useState('1')
  const [addPrice, setAddPrice] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.Cash)
  const [paymentNotes, setPaymentNotes] = useState('')
  const [itemEdits, setItemEdits] = useState<Record<string, ItemEdit>>({})
  const [lastSale, setLastSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeDraft = useMemo(
    () => drafts.find(draft => draft.id === activeDraftId) ?? drafts[0] ?? null,
    [drafts, activeDraftId]
  )

  const loadDrafts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const active = await posService.getActiveDrafts()
      setDrafts(active)
      setActiveDraftId(current => current && active.some(draft => draft.id === current) ? current : active[0]?.id ?? null)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load active bills.'))
    } finally {
      setLoading(false)
    }
  }, [])

  const searchProducts = useCallback(async () => {
    try {
      setError(null)
      setProducts(await productService.search({ query: query || undefined }))
    } catch (err) {
      setError(getErrorMessage(err, 'Product search failed.'))
    }
  }, [query])

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDrafts() }, 0)
    return () => window.clearTimeout(timer)
  }, [loadDrafts])

  useEffect(() => {
    const timer = window.setTimeout(() => { void searchProducts() }, 250)
    return () => window.clearTimeout(timer)
  }, [searchProducts])

  useEffect(() => {
    if (!activeDraft) return
    const timer = window.setTimeout(() => {
      setCustomerName(activeDraft.customerName ?? '')
      setCustomerPhone(activeDraft.customerPhone ?? '')
      setPaidAmount(activeDraft.totalAmount.toFixed(2))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [activeDraft])

  const replaceDraft = (draft: DraftSale) => {
    setDrafts(current => {
      if (current.some(item => item.id === draft.id)) {
        return current.map(item => item.id === draft.id ? draft : item)
      }
      return [draft, ...current]
    })
    setActiveDraftId(draft.id)
  }

  const removeDraftFromTabs = (draftId: string) => {
    const remaining = drafts.filter(draft => draft.id !== draftId)
    setDrafts(remaining)
    setActiveDraftId(remaining[0]?.id ?? null)
  }

  const createDraft = async () => {
    await runBusy(async () => {
      const draft = await posService.createDraft({ customerName: customerName || null, customerPhone: customerPhone || null })
      replaceDraft(draft)
      setLastSale(null)
    })
  }

  const selectProduct = async (product: Product) => {
    setSelectedProduct(product)
    setSelectedBatch(null)
    setAddPrice(product.mrp.toFixed(2))
    setBatches(await inventoryService.getByProduct(product.id))
  }

  const addSelectedItem = async () => {
    if (!activeDraft || !selectedProduct || !selectedBatch) return
    const quantity = Number.parseInt(addQuantity, 10)
    const sellingPrice = Number.parseFloat(addPrice)
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      setError('Enter a valid quantity and selling price.')
      return
    }

    await runBusy(async () => {
      const draft = await posService.addItem(activeDraft.id, {
        productId: selectedProduct.id,
        inventoryBatchId: selectedBatch.id,
        quantity,
        sellingPrice,
      })
      replaceDraft(draft)
      setSelectedProduct(null)
      setSelectedBatch(null)
      setBatches([])
      setAddQuantity('1')
      await searchProducts()
    })
  }

  const updateItem = async (item: DraftSaleItem) => {
    if (!activeDraft) return
    const edit = itemEdits[item.id] ?? { quantity: String(item.quantity), sellingPrice: String(item.sellingPrice) }
    const quantity = Number.parseInt(edit.quantity, 10)
    const sellingPrice = Number.parseFloat(edit.sellingPrice)
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      setError('Enter a valid quantity and selling price.')
      return
    }

    await runBusy(async () => {
      replaceDraft(await posService.updateItem(activeDraft.id, item.id, { quantity, sellingPrice }))
    })
  }

  const removeItem = async (item: DraftSaleItem) => {
    if (!activeDraft) return
    await runBusy(async () => {
      replaceDraft(await posService.removeItem(activeDraft.id, item.id))
      await searchProducts()
    })
  }

  const holdDraft = async () => {
    if (!activeDraft) return
    await runBusy(async () => {
      replaceDraft(await posService.hold(activeDraft.id))
    })
  }

  const cancelDraft = async () => {
    if (!activeDraft || !window.confirm('Cancel this bill and release reserved stock?')) return
    await runBusy(async () => {
      await posService.cancel(activeDraft.id)
      removeDraftFromTabs(activeDraft.id)
      await searchProducts()
    })
  }

  const completeDraft = async () => {
    if (!activeDraft) return
    const paid = Number.parseFloat(paidAmount)
    if (!Number.isFinite(paid) || paid < 0) {
      setError('Enter a valid paid amount.')
      return
    }

    await runBusy(async () => {
      const sale = await posService.complete(activeDraft.id, {
        paidAmount: paid,
        paymentMode,
        notes: paymentNotes || null,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
      })
      setLastSale(sale)
      setPaymentNotes('')
      removeDraftFromTabs(activeDraft.id)
      await searchProducts()
    })
  }

  const runBusy = async (work: () => Promise<void>) => {
    try {
      setBusy(true)
      setError(null)
      await work()
    } catch (err) {
      setError(getErrorMessage(err, 'POS action failed.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">POS Billing</h1>
          <p className="text-sm text-muted-foreground">Search products, reserve dealer batches, and complete counter sales</p>
        </div>
        <Button onClick={createDraft} size="sm" disabled={busy}>
          <FilePlus2Icon className="h-4 w-4" />
          New Bill
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {loading ? (
          <Badge variant="outline">Loading bills</Badge>
        ) : drafts.length === 0 ? (
          <Badge variant="outline">No active bills</Badge>
        ) : drafts.map(draft => (
          <button
            key={draft.id}
            type="button"
            onClick={() => setActiveDraftId(draft.id)}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-2 rounded-md border px-3 text-sm transition-colors',
              activeDraft?.id === draft.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
            )}
          >
            <ShoppingCartIcon className="h-3.5 w-3.5" />
            {draft.draftNumber}
            <span className="text-xs opacity-80">Rs. {draft.totalAmount.toFixed(0)}</span>
            {String(draft.status) === 'Hold' || draft.status === 2 ? <Badge variant="secondary">Hold</Badge> : null}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <ProductSearchPanel
          query={query}
          onQueryChange={setQuery}
          products={products}
          selectedProduct={selectedProduct}
          batches={batches}
          selectedBatch={selectedBatch}
          quantity={addQuantity}
          sellingPrice={addPrice}
          onSelectProduct={selectProduct}
          onSelectBatch={setSelectedBatch}
          onQuantityChange={setAddQuantity}
          onSellingPriceChange={setAddPrice}
          onAdd={addSelectedItem}
          disabled={!activeDraft || busy}
        />

        <DraftPanel
          draft={activeDraft}
          itemEdits={itemEdits}
          onEditChange={(itemId, edit) => setItemEdits(current => ({ ...current, [itemId]: edit }))}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          busy={busy}
        />

        <PaymentPanel
          draft={activeDraft}
          customerName={customerName}
          customerPhone={customerPhone}
          paidAmount={paidAmount}
          paymentMode={paymentMode}
          notes={paymentNotes}
          lastSale={lastSale}
          onCustomerNameChange={setCustomerName}
          onCustomerPhoneChange={setCustomerPhone}
          onPaidAmountChange={setPaidAmount}
          onPaymentModeChange={setPaymentMode}
          onNotesChange={setPaymentNotes}
          onHold={holdDraft}
          onCancel={cancelDraft}
          onComplete={completeDraft}
          busy={busy}
        />
      </div>
    </div>
  )
}

function ProductSearchPanel({
  query,
  onQueryChange,
  products,
  selectedProduct,
  batches,
  selectedBatch,
  quantity,
  sellingPrice,
  onSelectProduct,
  onSelectBatch,
  onQuantityChange,
  onSellingPriceChange,
  onAdd,
  disabled,
}: {
  query: string
  onQueryChange: (value: string) => void
  products: Product[]
  selectedProduct: Product | null
  batches: InventoryBatch[]
  selectedBatch: InventoryBatch | null
  quantity: string
  sellingPrice: string
  onSelectProduct: (product: Product) => Promise<void>
  onSelectBatch: (batch: InventoryBatch) => void
  onQuantityChange: (value: string) => void
  onSellingPriceChange: (value: string) => void
  onAdd: () => Promise<void>
  disabled: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={event => onQueryChange(event.target.value)} className="pl-8" placeholder="Search product, model, color, dealer" />
      </div>

      <div className="rounded-md border">
        <div className="border-b bg-muted/50 px-3 py-2 text-sm font-medium">Products</div>
        <div className="max-h-[340px] overflow-auto">
          {products.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">No products found.</div>
          ) : products.map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => void onSelectProduct(product)}
              className={cn(
                'block w-full border-b px-3 py-3 text-left text-sm last:border-b-0 hover:bg-muted/40',
                selectedProduct?.id === product.id && 'bg-muted'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{product.productName}</span>
                <Badge variant={product.availableQuantity > 0 ? 'secondary' : 'destructive'}>{product.availableQuantity}</Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Rs. {product.mrp.toFixed(2)} {product.bikeModelName ? `- ${product.bikeModelName}` : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Dealer Batch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {batches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No available stock batches.</p>
              ) : batches.map(batch => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => {
                    onSelectBatch(batch)
                    onSellingPriceChange(batch.mrp.toFixed(2))
                  }}
                  className={cn(
                    'w-full rounded-md border p-3 text-left text-sm hover:bg-muted/40',
                    selectedBatch?.id === batch.id && 'border-primary bg-muted'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{batch.dealerName}</span>
                    <Badge variant={batch.availableQuantity > 0 ? 'secondary' : 'destructive'}>{batch.availableQuantity} left</Badge>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{batch.batchNumber}</span>
                    <span>Code {batch.purchasePriceCode}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input value={quantity} onChange={event => onQuantityChange(event.target.value)} placeholder="Qty" />
              <Input value={sellingPrice} onChange={event => onSellingPriceChange(event.target.value)} placeholder="Selling price" />
            </div>
            <Button onClick={onAdd} disabled={disabled || !selectedBatch} className="w-full">
              Add to Bill
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DraftPanel({
  draft,
  itemEdits,
  onEditChange,
  onUpdateItem,
  onRemoveItem,
  busy,
}: {
  draft: DraftSale | null
  itemEdits: Record<string, ItemEdit>
  onEditChange: (itemId: string, edit: ItemEdit) => void
  onUpdateItem: (item: DraftSaleItem) => Promise<void>
  onRemoveItem: (item: DraftSaleItem) => Promise<void>
  busy: boolean
}) {
  if (!draft) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        Create or select a bill to start billing.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/50 px-4 py-3">
        <div>
          <h2 className="font-medium">{draft.draftNumber}</h2>
          <p className="text-xs text-muted-foreground">{draft.items.length} item lines reserved</p>
        </div>
        <Badge variant={String(draft.status) === 'Hold' || draft.status === 2 ? 'outline' : 'secondary'}>{statusText(draft.status)}</Badge>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-background">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Item</th>
              <th className="w-20 px-2 py-2 text-right font-medium">Qty</th>
              <th className="w-28 px-2 py-2 text-right font-medium">Price</th>
              <th className="w-24 px-2 py-2 text-right font-medium">Total</th>
              <th className="w-24 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {draft.items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Search and add a dealer batch.</td></tr>
            ) : draft.items.map(item => {
              const edit = itemEdits[item.id] ?? { quantity: String(item.quantity), sellingPrice: item.sellingPrice.toFixed(2) }
              return (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.productName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.dealerName} - {item.batchNumber} - Code {item.purchasePriceCodeSnapshot}</div>
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      value={edit.quantity}
                      onChange={event => onEditChange(item.id, { ...edit, quantity: event.target.value })}
                      className="h-8 text-right"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      value={edit.sellingPrice}
                      onChange={event => onEditChange(item.id, { ...edit, sellingPrice: event.target.value })}
                      className="h-8 text-right"
                    />
                  </td>
                  <td className="px-2 py-3 text-right font-medium">Rs. {item.lineTotal.toFixed(2)}</td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => onUpdateItem(item)} disabled={busy}>Save</Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => onRemoveItem(item)} disabled={busy}>
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
        <span className="text-sm text-muted-foreground">Bill total</span>
        <span className="text-xl font-semibold">Rs. {draft.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  )
}

function PaymentPanel({
  draft,
  customerName,
  customerPhone,
  paidAmount,
  paymentMode,
  notes,
  lastSale,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onPaidAmountChange,
  onPaymentModeChange,
  onNotesChange,
  onHold,
  onCancel,
  onComplete,
  busy,
}: {
  draft: DraftSale | null
  customerName: string
  customerPhone: string
  paidAmount: string
  paymentMode: PaymentMode
  notes: string
  lastSale: Sale | null
  onCustomerNameChange: (value: string) => void
  onCustomerPhoneChange: (value: string) => void
  onPaidAmountChange: (value: string) => void
  onPaymentModeChange: (value: PaymentMode) => void
  onNotesChange: (value: string) => void
  onHold: () => Promise<void>
  onCancel: () => Promise<void>
  onComplete: () => Promise<void>
  busy: boolean
}) {
  const paid = Number.parseFloat(paidAmount)
  const pending = draft ? Math.max(0, draft.totalAmount - (Number.isFinite(paid) ? paid : 0)) : 0

  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={customerName} onChange={event => onCustomerNameChange(event.target.value)} placeholder="Customer name" disabled={!draft} />
          <Input value={customerPhone} onChange={event => onCustomerPhoneChange(event.target.value)} placeholder="Customer phone" disabled={!draft} />
          <div className="grid grid-cols-2 gap-2">
            <Input value={paidAmount} onChange={event => onPaidAmountChange(event.target.value)} placeholder="Paid amount" disabled={!draft} />
            <select
              value={paymentMode}
              onChange={event => onPaymentModeChange(Number(event.target.value) as PaymentMode)}
              disabled={!draft}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            >
              <option value={PaymentMode.Cash}>Cash</option>
              <option value={PaymentMode.UPI}>UPI</option>
              <option value={PaymentMode.Card}>Card</option>
              <option value={PaymentMode.BankTransfer}>Bank</option>
              <option value={PaymentMode.Other}>Other</option>
            </select>
          </div>
          <Input value={notes} onChange={event => onNotesChange(event.target.value)} placeholder="Payment notes" disabled={!draft} />

          <div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="text-right font-medium">Rs. {(draft?.totalAmount ?? 0).toFixed(2)}</span>
            <span className="text-muted-foreground">Pending</span>
            <span className="text-right font-medium">Rs. {pending.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onHold} disabled={!draft || busy}>
              <PauseIcon className="h-4 w-4" />
              Hold
            </Button>
            <Button variant="destructive" onClick={onCancel} disabled={!draft || busy}>
              <XCircleIcon className="h-4 w-4" />
              Cancel
            </Button>
          </div>
          <Button onClick={onComplete} disabled={!draft || draft.items.length === 0 || busy} className="w-full">
            <CheckCircle2Icon className="h-4 w-4" />
            Complete Sale
          </Button>
        </CardContent>
      </Card>

      {lastSale && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Last Sale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Bill</span><span className="font-medium">{lastSale.saleNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>Rs. {lastSale.paidAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span>Rs. {lastSale.pendingAmount.toFixed(2)}</span></div>
            {lastSale.profitAmount != null && (
              <div className="flex justify-between"><span className="text-muted-foreground">Profit</span><span>Rs. {lastSale.profitAmount.toFixed(2)}</span></div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function statusText(status: DraftSale['status']) {
  if (typeof status === 'string') return status
  return ['Unknown', 'Draft', 'Hold', 'Completed', 'Cancelled'][status] ?? 'Unknown'
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
