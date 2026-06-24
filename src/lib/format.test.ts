import { describe, it, expect } from 'vitest'
import {
  formatSolChange,
  formatTxTime,
  lamportsToSol,
  shortenAddress,
} from './format'

describe('lamportsToSol', () => {
  it('converts 1e9 lamports to 1 SOL', () => {
    expect(lamportsToSol(1_000_000_000)).toBe(1)
  })

  it('converts 500_000_000 lamports to 0.5 SOL', () => {
    expect(lamportsToSol(500_000_000)).toBe(0.5)
  })

  it('handles zero', () => {
    expect(lamportsToSol(0)).toBe(0)
  })
})

describe('shortenAddress', () => {
  it('keeps the first and last 4 characters by default', () => {
    expect(shortenAddress('ABCDEFGHIJKLMNOPQRSTUVWX')).toBe('ABCD…UVWX')
  })

  it('respects a custom character count', () => {
    expect(shortenAddress('ABCDEFGHIJKLMNOPQRSTUVWX', 6)).toBe('ABCDEF…STUVWX')
  })

  it('returns short strings unchanged', () => {
    expect(shortenAddress('ABCD')).toBe('ABCD')
  })
})

describe('formatTxTime', () => {
  it('returns a dash for a missing block time', () => {
    expect(formatTxTime(null)).toBe('—')
  })

  it('formats a unix timestamp into a non-empty string', () => {
    expect(formatTxTime(1_700_000_000).length).toBeGreaterThan(0)
  })
})

describe('formatSolChange', () => {
  it('returns a dash when the change is unknown', () => {
    expect(formatSolChange(null)).toBe('—')
  })

  it('prefixes positive changes with a plus sign', () => {
    expect(formatSolChange(1.2)).toBe('+1.2000 SOL')
  })

  it('keeps the minus sign for negative changes', () => {
    expect(formatSolChange(-0.05)).toBe('-0.0500 SOL')
  })

  it('shows a clean zero for negligible (sub-0.0001) changes', () => {
    expect(formatSolChange(-0.000005)).toBe('0 SOL')
    expect(formatSolChange(0)).toBe('0 SOL')
  })
})
