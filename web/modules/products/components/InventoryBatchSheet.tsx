'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { dealerService } from '@/modules/dealers/services/dealerService'
import { productService } from '../services/productService'
import type { Dealer } from '@/modules/dealers/types'
import type { InventoryBatch, InventoryBatchPayload, Product, UpdateInventoryBatchPayload } from '../types'

const schema = z.object({
  productId: z.string().min(1, 'Product is required'),
  dealerId: z.string().min(1, 'Dealer is required'),
  batchNumber: z.string().max(100).optional().or(z.literal('')),
  mrp: z.coerce.number().min(0),
  purchasePrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1),
  currentQuantity: z.coerce.number().int().min(0),
  reservedQuantity: z.coerce.number().int().min(0),
  soldQuantity: z.coerce.number().int().min(0),
  damagedQuantity: z.coerce.number().int().min(0),
  minimumStockQuantity: z.coerce.number().int().min(0),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  isActive: z.boolean(),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  batch?: InventoryBatch
  onSubmit: (values: InventoryBatchPayload | UpdateInventoryBatchPayload) => Promise<void>
}

export function InventoryBatchSheet({ open, onOpenChange, batch, onSubmit }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [dealers, setDealers] = useState<Dealer[]>([])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mrp: 0,
      purchasePrice: 0,
      quantity: 1,
      currentQuantity: 0,
      reservedQuantity: 0,
      soldQuantity: 0,
      damagedQuantity: 0,
      minimumStockQuantity: 0,
      purchaseDate: new Date().toISOString().slice(0, 10),
      isActive: true,
    },
  })

  useEffect(() => {
    if (!open) return

    Promise.all([
      productService.search(),
      dealerService.getAll(),
    ]).then(([productList, dealerList]) => {
      setProducts(productList)
      setDealers(dealerList)
    })
  }, [open])

  useEffect(() => {
    if (open) {
      reset({
        productId: batch?.productId ?? '',
        dealerId: batch?.dealerId ?? '',
        batchNumber: batch?.batchNumber ?? '',
        mrp: batch?.mrp ?? 0,
        purchasePrice: batch?.purchasePrice ?? 0,
        quantity: batch?.initialQuantity ?? 1,
        currentQuantity: batch?.currentQuantity ?? 0,
        reservedQuantity: batch?.reservedQuantity ?? 0,
        soldQuantity: batch?.soldQuantity ?? 0,
        damagedQuantity: batch?.damagedQuantity ?? 0,
        minimumStockQuantity: batch?.minimumStockQuantity ?? 0,
        purchaseDate: batch?.purchaseDate ? batch.purchaseDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        isActive: batch?.isActive ?? true,
      })
    }
  }, [open, batch, reset])

  const handleFormSubmit = async (values: FormValues) => {
    if (batch) {
      await onSubmit({
        batchNumber: values.batchNumber || batch.batchNumber,
        mrp: values.mrp,
        purchasePrice: values.purchasePrice,
        currentQuantity: values.currentQuantity,
        reservedQuantity: values.reservedQuantity,
        soldQuantity: values.soldQuantity,
        damagedQuantity: values.damagedQuantity,
        minimumStockQuantity: values.minimumStockQuantity,
        purchaseDate: values.purchaseDate,
        isActive: values.isActive,
      })
    } else {
      await onSubmit({
        productId: values.productId,
        dealerId: values.dealerId,
        batchNumber: values.batchNumber || null,
        mrp: values.mrp,
        purchasePrice: values.purchasePrice,
        quantity: values.quantity,
        minimumStockQuantity: values.minimumStockQuantity,
        purchaseDate: values.purchaseDate,
      })
    }

    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{batch ? 'Edit Batch' : 'Add Inventory Batch'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {!batch && (
            <>
              <Field label="Product" error={errors.productId?.message} required>
                <Select {...register('productId')}>
                  <option value="">Select product</option>
                  {products.map(product => <option key={product.id} value={product.id}>{product.productName}</option>)}
                </Select>
              </Field>
              <Field label="Dealer" error={errors.dealerId?.message} required>
                <Select {...register('dealerId')}>
                  <option value="">Select dealer</option>
                  {dealers.map(dealer => <option key={dealer.id} value={dealer.id}>{dealer.name}</option>)}
                </Select>
              </Field>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Batch number">
              <Input {...register('batchNumber')} />
            </Field>
            <Field label="Purchase date" error={errors.purchaseDate?.message} required>
              <Input type="date" {...register('purchaseDate')} />
            </Field>
            <Field label="MRP">
              <Input type="number" step="0.01" {...register('mrp')} />
            </Field>
            <Field label="Purchase price">
              <Input type="number" step="0.01" {...register('purchasePrice')} />
            </Field>
            {!batch ? (
              <Field label="Quantity">
                <Input type="number" {...register('quantity')} />
              </Field>
            ) : (
              <>
                <Field label="Current">
                  <Input type="number" {...register('currentQuantity')} />
                </Field>
                <Field label="Reserved">
                  <Input type="number" {...register('reservedQuantity')} />
                </Field>
                <Field label="Sold">
                  <Input type="number" {...register('soldQuantity')} />
                </Field>
                <Field label="Damaged">
                  <Input type="number" {...register('damagedQuantity')} />
                </Field>
              </>
            )}
            <Field label="Minimum stock">
              <Input type="number" {...register('minimumStockQuantity')} />
            </Field>
          </div>

          {batch && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" {...register('isActive')} />
              Active batch
            </label>
          )}

          <SheetFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Saving...' : batch ? 'Update Batch' : 'Add Batch'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}{required ? ' *' : ''}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}
