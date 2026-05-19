'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Dealer } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  dealer?: Dealer
  onSubmit: (values: FormValues) => Promise<void>
}

export function DealerSheet({ open, onOpenChange, dealer, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        name: dealer?.name ?? '',
        phone: dealer?.phone ?? '',
        address: dealer?.address ?? '',
        notes: dealer?.notes ?? '',
      })
    }
  }, [open, dealer, reset])

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{dealer ? 'Edit Dealer' : 'Add Dealer'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
          <div className="space-y-1">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} />
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Saving...' : dealer ? 'Update Dealer' : 'Add Dealer'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
