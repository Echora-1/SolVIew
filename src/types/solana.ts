export type TxStatus = 'success' | 'failed'

export interface TxRow {
  signature: string
  status: TxStatus
  blockTime: number | null
  /** Net SOL change for the queried address; null when the tx wasn't parsed. */
  change: number | null
}

export interface NftItem {
  mint: string
  name: string
  image: string | null
  description: string
}

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error'
