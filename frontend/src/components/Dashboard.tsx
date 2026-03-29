import { useState, useMemo, useCallback, memo } from 'react'
import type { TokenInfo, SortOrder } from '../types'
import { applyFilters } from '../utils/tokenFilters'
import { useDebounce } from '../hooks/useDebounce'
import { Input } from './UI/Input'
import { Card } from './UI/Card'

interface DashboardProps {
  tokens?: TokenInfo[]
}

/**
 * Memoized with React.memo — re-renders only when the tokens prop changes.
 * Internal filter/sort state changes are isolated here and don't propagate upward.
 *
 * filteredTokens is wrapped in useMemo so the applyFilters computation only
 * re-runs when tokens, search, creator, or sort actually change.
 *
 * Event handlers are wrapped in useCallback so their references stay stable
 * across renders, which is important if they are ever passed to memoized children.
 */
const Dashboard: React.FC<DashboardProps> = memo(({ tokens }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [creatorFilter, setCreatorFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  const debouncedSearch = useDebounce(searchQuery, 300)
  const debouncedCreator = useDebounce(creatorFilter, 300)

  // Expensive filter + sort — only recomputes when inputs change
  const filteredTokens = useMemo(
    () => applyFilters(tokens, debouncedSearch, debouncedCreator, sortOrder),
    [tokens, debouncedSearch, debouncedCreator, sortOrder],
  )

  const isFilterActive = debouncedSearch !== '' || debouncedCreator !== ''

  // Stable callback references so child inputs don't re-render unnecessarily
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleCreatorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorFilter(e.target.value)
  }, [])

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as SortOrder)
  }, [])

  return (
    <div className="space-y-4">
      {/* FilterBar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            label="Search by name or symbol"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            label="Filter by creator address"
            value={creatorFilter}
            onChange={handleCreatorChange}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700">
            Sort order
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={handleSortChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {filteredTokens.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {isFilterActive
            ? 'No tokens match your search.'
            : 'No tokens have been deployed yet.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredTokens.map((token, i) => (
            <li key={i}>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">{token.name}</span>
                    <span className="ml-2 text-sm text-gray-500">({token.symbol})</span>
                  </div>
                  <span className="text-xs text-gray-400">Decimals: {token.decimals}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Total Supply:</span> {token.totalSupply}
                  </div>
                  <div className="truncate">
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
})

Dashboard.displayName = 'Dashboard'

export { Dashboard }
