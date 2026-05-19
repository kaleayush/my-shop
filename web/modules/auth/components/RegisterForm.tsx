'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '../schemas/registerSchema'
import { authService } from '../services/authService'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function RegisterForm() {
  const { setAuth } = useAuthStore()
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      const response = await authService.registerShopOwner(values)
      setAuth(
        { id: '', fullName: response.fullName, email: response.email, role: response.role, shopId: response.shopId },
        response.token
      )
      router.push('/')
    } catch {
      setServerError('Registration failed. Email may already be in use.')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl text-center">Create Your Shop</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input id="shopName" {...register('shopName')} />
            {errors.shopName && <p className="text-xs text-destructive">{errors.shopName.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input id="ownerName" {...register('ownerName')} />
            {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register('phone')} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="address">Address (optional)</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-xs text-destructive">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Shop'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already registered?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
