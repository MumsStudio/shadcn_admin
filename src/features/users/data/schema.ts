import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('cashier'),
  z.literal('manager'),
])

const userSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().nullable().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  status: userStatusSchema.optional(),
  role: userRoleSchema.optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
