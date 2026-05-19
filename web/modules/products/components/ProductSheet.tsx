'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import {
  bikeCompanyService,
  bikeModelService,
  brandService,
  categoryService,
  colorService,
  graphicService,
} from '@/modules/settings/services/settingsService'
import type { BikeModel, Category, SimpleEntity } from '@/modules/settings/types'
import type { ProductDetail, ProductPayload, UpdateProductPayload } from '../types'

const emptyToNull = (value: unknown) => value === '' ? null : value

const schema = z.object({
  productName: z.string().min(1, 'Product name is required').max(200),
  categoryId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  brandId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  bikeCompanyId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  bikeModelId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  colorId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  graphicId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  mrp: z.coerce.number().min(0),
  hindiName: z.string().max(200).optional().or(z.literal('')),
  searchKeywords: z.string().max(500).optional().or(z.literal('')),
  barcode: z.string().max(100).optional().or(z.literal('')),
  qrCode: z.string().max(200).optional().or(z.literal('')),
  minimumStockQuantity: z.coerce.number().int().min(0),
  isActive: z.boolean(),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductDetail
  onSubmit: (values: ProductPayload | UpdateProductPayload) => Promise<void>
}

export function ProductSheet({ open, onOpenChange, product, onSubmit }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<SimpleEntity[]>([])
  const [companies, setCompanies] = useState<SimpleEntity[]>([])
  const [models, setModels] = useState<BikeModel[]>([])
  const [colors, setColors] = useState<SimpleEntity[]>([])
  const [graphics, setGraphics] = useState<SimpleEntity[]>([])

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, mrp: 0, minimumStockQuantity: 0 },
  })

  const bikeCompanyId = useWatch({ control, name: 'bikeCompanyId' }) as string | null | undefined

  useEffect(() => {
    if (!open) return

    Promise.all([
      categoryService.getAll(),
      brandService.getAll(),
      bikeCompanyService.getAll(),
      colorService.getAll(),
      graphicService.getAll(),
    ]).then(([categoryList, brandList, companyList, colorList, graphicList]) => {
      setCategories(categoryList)
      setBrands(brandList)
      setCompanies(companyList)
      setColors(colorList)
      setGraphics(graphicList)
    })
  }, [open])

  useEffect(() => {
    if (!open) return

    const loadModels = async () => {
      if (bikeCompanyId) {
        setModels(await bikeModelService.getByCompany(bikeCompanyId))
      } else {
        setModels(await bikeModelService.getAll())
      }
    }

    loadModels()
  }, [open, bikeCompanyId])

  useEffect(() => {
    if (open) {
      reset({
        productName: product?.productName ?? '',
        categoryId: product?.categoryId ?? null,
        brandId: product?.brandId ?? null,
        bikeCompanyId: product?.bikeCompanyId ?? null,
        bikeModelId: product?.bikeModelId ?? null,
        colorId: product?.colorId ?? null,
        graphicId: product?.graphicId ?? null,
        mrp: product?.mrp ?? 0,
        hindiName: product?.hindiName ?? '',
        searchKeywords: product?.searchKeywords ?? '',
        barcode: product?.barcode ?? '',
        qrCode: product?.qrCode ?? '',
        minimumStockQuantity: product?.minimumStockQuantity ?? 0,
        isActive: product?.isActive ?? true,
      })
    }
  }, [open, product, reset])

  const handleFormSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      categoryId: values.categoryId || null,
      brandId: values.brandId || null,
      bikeCompanyId: values.bikeCompanyId || null,
      bikeModelId: values.bikeModelId || null,
      colorId: values.colorId || null,
      graphicId: values.graphicId || null,
      hindiName: values.hindiName || null,
      searchKeywords: values.searchKeywords || null,
      barcode: values.barcode || null,
      qrCode: values.qrCode || null,
    }

    if (product) {
      await onSubmit(payload)
    } else {
      await onSubmit({
        productName: payload.productName,
        categoryId: payload.categoryId,
        brandId: payload.brandId,
        bikeCompanyId: payload.bikeCompanyId,
        bikeModelId: payload.bikeModelId,
        colorId: payload.colorId,
        graphicId: payload.graphicId,
        mrp: payload.mrp,
        hindiName: payload.hindiName,
        searchKeywords: payload.searchKeywords,
        barcode: payload.barcode,
        qrCode: payload.qrCode,
        minimumStockQuantity: payload.minimumStockQuantity,
      })
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{product ? 'Edit Product' : 'Add Product'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Product name" error={errors.productName?.message} required>
              <Input {...register('productName')} />
            </Field>
            <Field label="MRP" error={errors.mrp?.message} required>
              <Input type="number" step="0.01" {...register('mrp')} />
            </Field>
            <Field label="Category">
              <Select {...register('categoryId')}>
                <option value="">None</option>
                {categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <Field label="Brand">
              <Select {...register('brandId')}>
                <option value="">None</option>
                {brands.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <Field label="Bike company">
              <Select {...register('bikeCompanyId')}>
                <option value="">None</option>
                {companies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <Field label="Bike model">
              <Select {...register('bikeModelId')}>
                <option value="">None</option>
                {models.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <Field label="Color">
              <Select {...register('colorId')}>
                <option value="">None</option>
                {colors.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <Field label="Graphic">
              <Select {...register('graphicId')}>
                <option value="">None</option>
                {graphics.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <Field label="Minimum stock">
              <Input type="number" {...register('minimumStockQuantity')} />
            </Field>
            <Field label="Barcode">
              <Input {...register('barcode')} />
            </Field>
            <Field label="Hindi name">
              <Input {...register('hindiName')} />
            </Field>
            <Field label="QR code">
              <Input {...register('qrCode')} />
            </Field>
          </div>

          <Field label="Search keywords">
            <Input {...register('searchKeywords')} />
          </Field>

          {product && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" {...register('isActive')} />
              Active product
            </label>
          )}

          <SheetFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
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
      <Label>
        {label}{required ? ' *' : ''}
      </Label>
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
