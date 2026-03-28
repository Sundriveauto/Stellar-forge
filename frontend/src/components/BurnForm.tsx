import { useState, useEffect } from 'react'
import { Input } from './UI/Input'
import { Button } from './UI/Button'
import { Card } from './UI/Card'
import { useDebounce } from '../hooks/useDebounce'
import { useWallet } from '../hooks/useWallet'
import { stellarService } from '../services/stellar'
import type { TokenInfo } from '../types'

function parseBurnError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('BurnAmountExceedsBalance')) {
    return 'Burn amount exceeds your token balance.'
  }
  if (msg.includes('greater than 0') || msg.includes('InvalidBurnAmount')) {
    return 'Burn amount must be greater than 0.'
  }
  return msg || 'An unexpected error occurred.'
}

export const BurnForm: React.FC = () => {
  const { wallet } = useWallet()

  const [tokenAddress, setTokenAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [updatedSupply, setUpdatedSupply] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successHash, setSuccessHash] = useState<string | null>(null)

  // field-level validation
  const amountNum = parseFloat(amount)
  const amountError =
    amount !== '' && (isNaN(amountNum) || amountNum <= 0)
      ? 'Amount must be greater than 0.'
      : undefined

  const debouncedAddress = useDebounce(tokenAddress, 300)

  useEffect(() => {
    setTokenInfo(null)
    setUpdatedSupply(null)
    if (!debouncedAddress) return
    stellarService.getTokenInfo(debouncedAddress).then(setTokenInfo)
  }, [debouncedAddress])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessHash(null)
    setUpdatedSupply(null)

    if (!wallet.isConnected || !wallet.address) {
      setError('Please connect your wallet first.')
      return
    }

    if (!tokenAddress) {
      setError('Token address is required.')
      return
    }

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Burn amount must be greater than 0.')
      return
    }

    setIsLoading(true)
    try {
      const result = await stellarService.burnTokens({
        tokenAddress,
        from: wallet.address,
        amount,
      })

      setSuccessHash(result.transactionHash)

      if (result.newTotalSupply !== undefined) {
        setUpdatedSupply(result.newTotalSupply)
      } else {
        // re-fetch token info to show updated supply
        const refreshed = await stellarService.getTokenInfo(tokenAddress)
        if (refreshed) {
          setTokenInfo(refreshed)
          setUpdatedSupply(refreshed.totalSupply)
        }
      }

      setAmount('')
    } catch (err) {
      setError(parseBurnError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card title="Burn Tokens" headingLevel={2}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Token Address"
          value={tokenAddress}
          onChange={e => { setTokenAddress(e.target.value); setError(null) }}
          placeholder="G..."
          required
        />

        {tokenInfo && (
          <div className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-700 space-y-1">
            <p><span className="font-medium">Token:</span> {tokenInfo.name} ({tokenInfo.symbol})</p>
            <p>
              <span className="font-medium">Total Supply:</span>{' '}
              <span className={updatedSupply !== null ? 'text-red-600 font-semibold' : ''}>
                {updatedSupply ?? tokenInfo.totalSupply}
              </span>
              {updatedSupply !== null && (
                <span className="ml-2 text-xs text-gray-500">(updated after burn)</span>
              )}
            </p>
          </div>
        )}

        <Input
          label="Amount"
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={e => { setAmount(e.target.value); setError(null) }}
          placeholder="0"
          error={amountError}
          required
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {successHash && (
          <p role="status" className="text-sm text-green-600">
            Burn successful. Tx: <span className="font-mono break-all">{successHash}</span>
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500"
          loading={isLoading}
          disabled={isLoading || !!amountError}
        >
          {isLoading ? 'Burning...' : 'Burn Tokens'}
        </Button>
      </form>
    </Card>
  )
}
