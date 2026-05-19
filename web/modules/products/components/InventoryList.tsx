'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangleIcon, PencilIcon, PlusIcon, RotateCcwIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InventoryBatchSheet } from './InventoryBatchSheet'
import { inventoryService } from '../services/productService'
import type { InventoryBatch, InventoryBatchPayload, UpdateInventoryBatchPayload } from '../types'

export function InventoryList() {
  const [batches, setBatches] = useState<InventoryBatch[]>([])
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryBatch | undefined>()
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [adjustBy, setAdjustBy] = useState('1')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setBatches(lowStockOnly ? await inventoryService.lowStock() : await inventoryService.getAll())
    } catch {
      setError('Failed to load inventory.')
    } finally {
      setLoading(false)
    }
  }, [lowStockOnly])

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const handleAdd = () => {
    setEditing(undefined)
    setSheetOpen(true)
  }

  const handleSubmit = async (values: InventoryBatchPayload | UpdateInventoryBatchPayload) => {
    if (editing) {
      await inventoryService.updateBatch(editing.id, values as UpdateInventoryBatchPayload)
    } else {
      await inventoryService.createBatch(values as InventoryBatchPayload)
    }
    await load()
  }

  const handleAdjust = async (batch: InventoryBatch) => {
    const delta = Number.parseInt(adjustBy, 10)
    if (!Number.isFinite(delta) || delta === 0) return

    await inventoryService.adjust({ inventoryBatchId: batch.id, quantityDelta: delta, reason: 'Manual stock adjustment' })
    setAdjustingId(null)
    setAdjustBy('1')
    await load()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">Dealer-wise product batches, purchase codes, and low-stock control</p>
        </div>
        <div className="flex gap-2">
          <Button variant={lowStockOnly ? 'default' : 'outline'} size="sm" onClick={() => setLowStockOnly(value => !value)}>
            <AlertTriangleIcon className="h-4 w-4" />
            Low Stock
          </Button>
          <Button onClick={handleAdd} size="sm">
            <PlusIcon className="h-4 w-4" />
            Add Batch
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Product</th>
              <th className="px-4 py-2 text-left font-medium">Dealer</th>
              <th className="px-4 py-2 text-left font-medium">Batch</th>
              <th className="px-4 py-2 text-right font-medium">Stock</th>
              <th className="px-4 py-2 text-right font-medium">Price</th>
              <th className="px-4 py-2 text-left font-medium">Code</th>
              <th className="w-44 px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No inventory batches found.</td></tr>
            ) : batches.map(batch => (
              <tr key={batch.id} className="border-t transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{batch.productName}</td>
                <td className="px-4 py-3 text-muted-foreground">{batch.dealerName}</td>
                <td className="px-4 py-3 text-muted-foreground">{batch.batchNumber}</td>
                <td className="px-4 py-3 text-right">
                  <div className="font-medium">{batch.currentQuantity}</div>
                  <div className="text-xs text-muted-foreground">{batch.reservedQuantity} reserved</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div>MRP Rs. {batch.mrp.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {batch.purchasePrice == null ? 'Hidden' : `Buy Rs. ${batch.purchasePrice.toFixed(2)}`}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={batch.isLowStock ? 'destructive' : 'secondary'}>
                    {batch.purchasePriceCode}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {adjustingId === batch.id ? (
                      <>
                        <Input value={adjustBy} onChange={event => setAdjustBy(event.target.value)} className="h-7 w-16" />
                        <Button size="sm" variant="outline" onClick={() => handleAdjust(batch)}>Apply</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="icon-sm" onClick={() => setAdjustingId(batch.id)}>
                        <RotateCcwIcon className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(batch); setSheetOpen(true) }}>
                      <PencilIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InventoryBatchSheet open={sheetOpen} onOpenChange={setSheetOpen} batch={editing} onSubmit={handleSubmit} />
    </div>
  )
}
