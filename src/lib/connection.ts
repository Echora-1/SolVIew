import { Connection } from '@solana/web3.js'

const DEFAULT_RPC = 'https://api.mainnet-beta.solana.com'

/** RPC endpoint: a custom one from the env, or the public mainnet node. */
export function getRpcUrl(): string {
  const url = import.meta.env.VITE_RPC_URL
  return url && url.length > 0 ? url : DEFAULT_RPC
}

/** Shared connection instance reused across the app. */
export const connection = new Connection(getRpcUrl(), 'confirmed')
