import { z } from 'zod'

export const registerSchema = z.object({
  shopName: z.string().min(1, 'Shop name required').max(100),
  ownerName: z.string().min(1, 'Owner name required').max(100),
  phone: z.string().min(1, 'Phone required').max(20),
  address: z.string().optional(),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
