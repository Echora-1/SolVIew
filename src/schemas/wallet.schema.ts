import { z } from 'zod'

// Base58 alphabet excludes the visually ambiguous characters 0, O, I and l.
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export const addressSchema = z.object({
  address: z
    .string()
    .min(1, 'Введите адрес кошелька')
    .regex(BASE58, 'Введите корректный Solana-адрес'),
})

export type AddressForm = z.infer<typeof addressSchema>
