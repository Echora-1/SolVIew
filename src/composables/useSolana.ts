import { PublicKey } from '@solana/web3.js'
import type { ParsedTransactionWithMeta } from '@solana/web3.js'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
  fetchAllDigitalAssetByOwner,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata'
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi'
import { connection, getRpcUrl } from '../lib/connection'
import { lamportsToSol } from '../lib/format'
import { isRateLimitError } from '../lib/rpcError'
import type { NftItem, TxRow } from '../types/solana'

const MAX_TXS = 10
const MAX_NFTS = 24
const RETRY_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 400

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Retry a request with exponential backoff when the RPC rate-limits us. */
async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = RETRY_ATTEMPTS,
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isRateLimitError(error) || i === attempts - 1) throw error
      await sleep(2 ** i * RETRY_BASE_DELAY_MS)
    }
  }
  throw lastError
}

/**
 * Net SOL change for `address` in a parsed transaction, from the difference
 * between its pre- and post-balances. Null when the tx is missing or the
 * address is not among its accounts.
 */
function computeChange(
  tx: ParsedTransactionWithMeta | null,
  address: string,
): number | null {
  if (!tx?.meta) return null
  const index = tx.transaction.message.accountKeys.findIndex(
    (key) => key.pubkey.toBase58() === address,
  )
  if (index === -1) return null
  const delta = tx.meta.postBalances[index] - tx.meta.preBalances[index]
  return lamportsToSol(delta)
}

/** Normalize IPFS/Arweave URIs to a fetchable HTTP URL. */
function normalizeUri(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.slice('ipfs://'.length)}`
  }
  return uri
}

interface OffChainMetadata {
  image?: string
  description?: string
}

interface DasAsset {
  interface: string
  id: string
  content?: {
    metadata?: { name?: string; description?: string }
    links?: { image?: string }
    files?: { uri?: string; cdn_uri?: string }[]
  }
}

interface DasResponse {
  result?: { items: DasAsset[] }
  error?: { code: number; message: string }
}

const FUNGIBLE_INTERFACES = new Set(['FungibleToken', 'FungibleAsset'])

/**
 * Resolve an NFT image from a DAS asset. `links.image` is usually set, but some
 * assets only expose it through `files` (preferring the CDN-cached variant).
 */
function pickDasImage(asset: DasAsset): string | null {
  const fromLinks = asset.content?.links?.image
  if (fromLinks) return normalizeUri(fromLinks)

  const file = asset.content?.files?.find((f) => f.cdn_uri || f.uri)
  const fromFiles = file?.cdn_uri ?? file?.uri
  return fromFiles ? normalizeUri(fromFiles) : null
}

/**
 * Primary NFT source: the DAS API (Helius, Triton, …). Unlike a token-account
 * scan it also returns compressed NFTs, which have no SPL token account at all.
 * Returns null when the RPC does not implement DAS (e.g. the public node), so
 * the caller can fall back to the Metaplex path.
 */
async function fetchNftsViaDas(
  address: string,
  limit: number,
): Promise<NftItem[] | null> {
  let json: DasResponse
  try {
    const res = await fetch(getRpcUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'get-assets',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: address,
          page: 1,
          limit,
          displayOptions: { showFungible: false },
        },
      }),
    })
    if (!res.ok) return null
    json = (await res.json()) as DasResponse
  } catch {
    return null
  }

  if (json.error || !json.result) return null

  return json.result.items
    .filter((asset) => !FUNGIBLE_INTERFACES.has(asset.interface))
    .map((asset) => ({
      mint: asset.id,
      name: asset.content?.metadata?.name?.trim() ?? '',
      image: pickDasImage(asset),
      description: asset.content?.metadata?.description ?? '',
    }))
}

/**
 * Fallback NFT source for non-DAS RPCs: read the owner's token accounts via
 * Metaplex, keep mints with 0 decimals (fungible coins carry metadata too but
 * have decimals > 0), then fetch each off-chain metadata JSON for the image.
 * This does not see compressed NFTs.
 */
async function fetchNftsViaMetaplex(
  address: string,
  limit: number,
): Promise<NftItem[]> {
  const umi = createUmi(getRpcUrl()).use(mplTokenMetadata())

  const assets = await withRetry(() =>
    fetchAllDigitalAssetByOwner(umi, umiPublicKey(address)),
  )

  const limited = assets
    .filter((asset) => asset.mint.decimals === 0)
    .slice(0, limit)

  return Promise.all(
    limited.map(async (asset): Promise<NftItem> => {
      const base: NftItem = {
        mint: asset.publicKey.toString(),
        name: asset.metadata.name.replace(/\0/g, '').trim(),
        image: null,
        description: '',
      }

      const uri = asset.metadata.uri.replace(/\0/g, '').trim()
      if (!uri) return base

      try {
        const res = await fetch(normalizeUri(uri))
        if (!res.ok) return base
        const json = (await res.json()) as OffChainMetadata
        return {
          ...base,
          image: json.image ? normalizeUri(json.image) : null,
          description: json.description ?? '',
        }
      } catch {
        // Off-chain metadata is best-effort; keep the on-chain name.
        return base
      }
    }),
  )
}

export function useSolana() {
  async function getBalance(address: string): Promise<number> {
    return withRetry(async () => {
      const lamports = await connection.getBalance(new PublicKey(address))
      return lamportsToSol(lamports)
    })
  }

  async function getTransactions(
    address: string,
    limit: number = MAX_TXS,
  ): Promise<TxRow[]> {
    const pubkey = new PublicKey(address)
    const signatures = await withRetry(() =>
      connection.getSignaturesForAddress(pubkey, { limit }),
    )
    if (signatures.length === 0) return []

    // Fetch transactions one by one: batching them in a single
    // getParsedTransactions call can exceed the RPC response size limit (413).
    // A failed parse falls back to the data already in the signature record.
    const parsed = await Promise.all(
      signatures.map((sig) =>
        connection
          .getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 })
          .catch(() => null),
      ),
    )

    return signatures.map((sig, i): TxRow => {
      const tx = parsed[i]
      const failed = sig.err !== null || tx?.meta?.err != null
      return {
        signature: sig.signature,
        status: failed ? 'failed' : 'success',
        blockTime: tx?.blockTime ?? sig.blockTime ?? null,
        change: computeChange(tx, address),
      }
    })
  }

  async function getNfts(
    address: string,
    limit: number = MAX_NFTS,
  ): Promise<NftItem[]> {
    const viaDas = await fetchNftsViaDas(address, limit)
    if (viaDas !== null) return viaDas
    return fetchNftsViaMetaplex(address, limit)
  }

  return { getBalance, getTransactions, getNfts }
}
