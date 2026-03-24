import React, { useState, useMemo, useCallback } from 'react'
import { Input, PaginationControls } from './UI'
import { TransactionHistory } from './TransactionHistory'
import { useDebounce } from '../hooks/useDebounce'
import { useTokens } from '../hooks/useTokens'
import { STELLAR_CONFIG } from '../config/stellar'

const PAGE_SIZE = 10

export const TokenDashboard: React.FC = () => {
  const { tokens, isLoading, error, page, totalCount, totalPages, setPage } =
    useTokens(PAGE_SIZE)

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const handleCopyAddress = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(null), 1800)
    } catch {
      // clipboard not available
    }
  }, [])

  const formatCreationDate = useCallback((createdAt: number | undefined) => {
    if (!createdAt) return 'Unknown'
    return new Date(createdAt * 1000).toLocaleString()
  }, [])

  const filteredTokens = useMemo(() => {
    if (!debouncedSearch.trim()) return tokens
    const query = debouncedSearch.toLowerCase()
    return tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.symbol.toLowerCase().includes(query) ||
        t.creator.toLowerCase().includes(query),
    )
  }, [tokens, debouncedSearch])

  const factoryContractId = STELLAR_CONFIG.factoryContractId

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Search tokens"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by address, name or symbol..."
        />

        {isLoading && (
          <p className="text-sm text-gray-500">Loading tokens...</p>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!isLoading && !error && (
          <>
            <ul className="space-y-2">
              {filteredTokens.length === 0 ? (
                <li className="text-sm text-gray-500">No tokens found.</li>
              ) : (
                filteredTokens.map((token, i) => (
                  <li
                    key={token.creator + i}
                    className="p-3 border rounded text-sm flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-medium">{token.name}</span>
                      <span className="ml-2 text-gray-500">({token.symbol})</span>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Created: {formatCreationDate(token.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyAddress(token.creator)}
                      className="text-xs text-blue-500 hover:underline shrink-0"
                      aria-label={`Copy address for ${token.name}`}
                    >
                      {copiedAddress === token.creator ? 'Copied!' : 'Copy address'}
                    </button>
                  </li>
                ))
              )}
            </ul>

            {/* Only show pagination when not filtering by search */}
            {!debouncedSearch.trim() && (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                onPrev={() => setPage(page - 1)}
                onNext={() => setPage(page + 1)}
              />
            )}
          </>
        )}
      </div>

      {factoryContractId && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
          <TransactionHistory contractId={factoryContractId} />
        </div>
      )}
    </div>
  )
}

export const Dashboard = TokenDashboard
