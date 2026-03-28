import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Input, PaginationControls, Spinner, Button } from './UI'
import { TransactionHistory } from './TransactionHistory'
import { TokenCard } from './TokenCard'
import { useDebounce } from '../hooks/useDebounce'
import { useTokenDashboard } from '../hooks/useTokenDashboard'
import { STELLAR_CONFIG } from '../config/stellar'

function SkeletonCard() {
  return (
    <li className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
        </div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20" />
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title', 'Token Dashboard')}
          </h2>
          {totalCount > 0 && !isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {totalCount} token{totalCount !== 1 ? 's' : ''} deployed
            </p>
          )}
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

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400" role="alert">
          {error.message}
        </p>
      )}

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
