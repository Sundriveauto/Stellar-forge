import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { stellarService } from '../services/stellar'
import { ShareButton } from './ShareButton'
import type { TokenInfo } from '../types'

const BASE_URL = 'https://stellarforge.app'

function setMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export const TokenDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>()
  const [token, setToken] = useState<TokenInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return
    stellarService
      .getTokenInfo(address)
      .then((t) => setToken(t as TokenInfo))
      .catch((err: Error) => setError(err.message || 'Unable to load token'))
  }, [address])

  // Inject Open Graph meta tags for rich link previews
  useEffect(() => {
    if (!token || !address) return

    const title = `${token.name} (${token.symbol}) — StellarForge`
    const description = `${token.name} is a Stellar token with symbol ${token.symbol}, ${token.decimals} decimals, and a total supply of ${token.totalSupply}. Created by ${token.creator}.`
    const url = `${BASE_URL}/token/${address}`

    document.title = title
    setMeta('og:type', 'website')
    setMeta('og:title', title)
    setMeta('og:description', description)
    setMeta('og:url', url)
    setMeta('og:site_name', 'StellarForge')
    setMeta('twitter:card', 'summary')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:site', '@StellarForge')

    return () => {
      document.title = 'StellarForge - Stellar Token Deployer'
    }
  }, [token, address])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Token Detail</h2>
        {address && (
          <ShareButton
            tokenAddress={address}
            tokenName={token?.name}
            tokenSymbol={token?.symbol}
          />
        )}
      </div>

      <div className="p-4 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700">
        {error && <p className="text-red-500">{error}</p>}
        {!token && !error && <p className="text-gray-500">Loading token {address}...</p>}
        {token && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{token.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Symbol</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{token.symbol}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Decimals</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{token.decimals}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Total Supply</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{token.totalSupply}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Creator</dt>
              <dd className="font-mono text-xs text-gray-900 dark:text-white break-all">{token.creator}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  )
}
