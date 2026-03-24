import { useState, useEffect, useCallback } from 'react'
import { useStellarContext } from '../context/StellarContext'
import { useWallet } from './useWallet'
import type { TokenInfo } from '../types'

const PAGE_SIZE_DEFAULT = 10

interface UseTokensResult {
  tokens: TokenInfo[]
  isLoading: boolean
  error: string | null
  page: number
  totalCount: number
  totalPages: number
  setPage: (page: number) => void
  reload: () => void
}

/**
 * Fetches tokens created by the connected wallet, with page/pageSize pagination.
 * Tokens are fetched all-at-once from the service and sliced client-side so
 * we can show accurate totals without multiple round-trips.
 */
export function useTokens(pageSize: number = PAGE_SIZE_DEFAULT): UseTokensResult {
  const { stellarService } = useStellarContext()
  const { wallet } = useWallet()

  const [allTokens, setAllTokens] = useState<TokenInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    if (!wallet.address) {
      setAllTokens([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const list = await stellarService.getTokensByCreator(wallet.address)
      setAllTokens(list)
      setPage(1) // reset to first page on reload
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens')
      setAllTokens([])
    } finally {
      setIsLoading(false)
    }
  }, [wallet.address, stellarService])

  useEffect(() => {
    load()
  }, [load])

  const totalCount = allTokens.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Clamp page in case tokens shrink
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const tokens = allTokens.slice(startIndex, startIndex + pageSize)

  return {
    tokens,
    isLoading,
    error,
    page: safePage,
    totalCount,
    totalPages,
    setPage,
    reload: load,
  }
}
