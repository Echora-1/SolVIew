import { describe, it, expect } from 'vitest'
import { addressSchema } from './wallet.schema'

const VALID = '4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T'

describe('addressSchema', () => {
  it('accepts a valid base58 mainnet address', () => {
    expect(addressSchema.safeParse({ address: VALID }).success).toBe(true)
  })

  it('rejects an empty string as required', () => {
    expect(addressSchema.safeParse({ address: '' }).success).toBe(false)
  })

  it('rejects strings shorter than 32 characters', () => {
    expect(addressSchema.safeParse({ address: 'a'.repeat(31) }).success).toBe(false)
  })

  it('rejects strings longer than 44 characters', () => {
    expect(addressSchema.safeParse({ address: 'a'.repeat(45) }).success).toBe(false)
  })

  it('rejects forbidden base58 characters (0, O, I, l)', () => {
    for (const bad of ['0', 'O', 'I', 'l']) {
      const value = bad + 'a'.repeat(34)
      expect(addressSchema.safeParse({ address: value }).success).toBe(false)
    }
  })
})
