import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CopyButton } from './CopyButton'
import { Input, PaginationControls } from './UI'
import { TransactionHistory } from './TransactionHistory'
import { TokenCard } from './TokenCard'
import { useDebounce } from '../hooks/useDebounce'
import { useTokenDashboard } from '../hooks/useTokenDashboard'
import { STELLAR_CONFIG } from '../config/stellar'

function SkeletonCard() {
  return (
    <li className="p-3 border rounded animate-pulse flex items-center justify-between gap-2">
      <div className="space-y-1.5 flex-1">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </li>
  )
}

export const TokenDashboard: React.FC = () => {
  const { rows, isLoading, error, page, totalPages, totalCount, pageSize, setPage, refresh } =
    useTokenDashboard()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const filteredRows = useMemo(() => {
    if (!debouncedSearch.trim()) return rows
    const q = debouncedSearch.toLowerCase()
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.symbol.toLowerCase().includes(q),
    )
  }, [rows, debouncedSearch])

  const factoryContractId = STELLAR_CONFIG.factoryContractId

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            label={t('dashboard.searchLabel')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or symbol..."
          />
          <button
            onClick={refresh}
            disabled={isLoading}
            className="mt-6 px-3 py-2 text-sm rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors shrink-0"
            aria-label="Refresh token list"
          >
            ↻ Refresh
          </button>
        </div>
        <Button
          onClick={refresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          aria-label="Refresh token list"
        >
          {isLoading ? <Spinner size="sm" /> : '↻ Refresh'}
        </Button>
      </div>

      {/* Search */}
      <Input
        label={t('dashboard.searchLabel', 'Search tokens')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or symbol…"
      />

        <ul className="space-y-2" aria-label="Deployed tokens">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filteredRows.length === 0 ? (
            <li className="text-sm text-gray-500 py-4 text-center">
              {totalCount === 0
                ? 'No tokens have been deployed yet.'
                : 'No tokens match your search.'}
            </li>
          ) : (
            filteredRows.map((token) => (
              <li
                key={token.address}
                className="p-3 border rounded text-sm flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors dark:bg-slate-800 dark:border-slate-700"
              >
                <Link
                  to={`/tokens/${token.address}`}
                  className="flex-1 min-w-0 hover:underline"
                  title={`View ${token.name} details`}
                >
                  <span className="font-medium">{token.name}</span>
                  <span className="ml-2 text-gray-500 font-mono">({token.symbol})</span>
                  <div
                    className="text-xs text-gray-400 mt-0.5 font-mono truncate"
                    title={token.address}
                  >
                    {formatAddress(token.address)}
                  </div>
                  {token.creator && (
                    <div className="text-xs text-gray-400 font-mono truncate" title={token.creator}>
                      Creator: {formatAddress(token.creator)}
                    </div>
                  )}
                </Link>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <CopyButton value={token.address} ariaLabel="Copy token address" />
                  <a
                    href={explorerUrl(token.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                    aria-label={`View ${token.name} on Stellar Explorer`}
                  >
                    ↗
                  </a>
                </div>
              </li>
            ))
          )}
        </ul>

      {/* Token list */}
      <ul className="space-y-3" aria-label="Deployed tokens" aria-live="polite">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredRows.length === 0 ? (
          <li className="py-16 text-center space-y-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {totalCount === 0
                ? t('dashboard.empty', 'No tokens have been deployed yet.')
                : t('dashboard.noResults', 'No tokens match your search.')}
            </p>
            {totalCount === 0 && (
              <Link to="/create">
                <Button variant="primary" size="sm">
                  {t('dashboard.createCta', 'Create your first token')}
                </Button>
              </Link>
            )}
          </li>
        ) : (
          filteredRows.map((token) => <TokenCard key={token.address} token={token} />)
        )}
      </ul>

      {/* Pagination — only shown when not searching */}
      {!debouncedSearch.trim() && !isLoading && totalCount > pageSize && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPrev={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
        />
      )}

      {/* Recent activity */}
      {factoryContractId && (
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {t('dashboard.recentActivity', 'Recent Activity')}
          </h3>
          <TransactionHistory contractId={factoryContractId} />
        </div>
      )}
    </div>
  )
}

// Alias kept for backward-compat with existing App.tsx import
export const Dashboard = TokenDashboard
