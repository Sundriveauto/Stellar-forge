import { useState, useMemo } from 'react'
import type { TokenInfo, SortOrder } from '../types'
import { applyFilters } from '../utils/tokenFilters'
import { useDebounce } from '../hooks/useDebounce'
import { Input } from './UI/Input'
import { Card } from './UI/Card'

interface DashboardProps {
  tokens?: TokenInfo[]
}

export const Dashboard: React.FC<DashboardProps> = ({ tokens }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [creatorFilter, setCreatorFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  const debouncedSearch = useDebounce(searchQuery, 300)
  const debouncedCreator = useDebounce(creatorFilter, 300)

  const filteredTokens = useMemo(
    () => applyFilters(tokens, debouncedSearch, debouncedCreator, sortOrder),
    [tokens, debouncedSearch, debouncedCreator, sortOrder]
  )

  const isFilterActive = debouncedSearch !== '' || debouncedCreator !== ''

  return (
    <div className="space-y-4">
      {/* FilterBar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <Input
            label="Search by name or symbol"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Input
            label="Filter by creator address"
            value={creatorFilter}
            onChange={e => setCreatorFilter(e.target.value)}
          />
        </div>
        <div className="space-y-1 w-full sm:w-auto sm:min-w-[180px]">
          <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort order
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as SortOrder)}
            className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm bg-white dark:bg-gray-700 dark:text-white min-h-[44px]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {filteredTokens.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm sm:text-base">
          {isFilterActive
            ? 'No tokens match your search.'
            : 'No tokens have been deployed yet.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredTokens.map((token, i) => (
            <li key={i}>
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">{token.name}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({token.symbol})</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Decimals: {token.decimals}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div>
                    <span className="font-medium">Total Supply:</span> {token.totalSupply}
                  </div>
                  <div className="break-all sm:truncate">
                    <span className="font-medium">Creator:</span>{' '}
                    <span className="font-mono text-xs">{token.creator}</span>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
