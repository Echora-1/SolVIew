export const LAMPORTS_PER_SOL = 1_000_000_000

/** Number of fractional digits used when displaying SOL amounts. */
export const SOL_FRACTION_DIGITS = 4

const MS_PER_SECOND = 1000

/** Convert lamports (the smallest SOL unit) to SOL. */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL
}

/** Format a SOL amount with the standard number of fractional digits. */
export function formatSol(amount: number): string {
  return amount.toFixed(SOL_FRACTION_DIGITS)
}

/** Render a long base58 address as `ABCD…WXYZ`. */
export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2) return address
  return `${address.slice(0, chars)}…${address.slice(-chars)}`
}

/** Format a Solana block time (unix seconds) as a short local date-time. */
export function formatTxTime(blockTime: number | null): string {
  if (blockTime == null) return '—'
  return new Date(blockTime * MS_PER_SECOND).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Format a net SOL balance change with an explicit sign. */
export function formatSolChange(change: number | null): string {
  if (change == null) return '—'
  const rounded = Number(formatSol(change))
  if (rounded === 0) return '0 SOL'
  return `${rounded > 0 ? '+' : ''}${formatSol(rounded)} SOL`
}

/** Direction of a SOL change after rounding, for coloring. */
export function solChangeTone(change: number | null): 'up' | 'down' | 'flat' {
  if (change == null) return 'flat'
  const rounded = Number(formatSol(change))
  if (rounded === 0) return 'flat'
  return rounded > 0 ? 'up' : 'down'
}
