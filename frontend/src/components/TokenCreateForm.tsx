import { useState } from 'react'
import { Input } from './UI/Input'
import { Button } from './UI/Button'
import { MainnetConfirmationModal } from './UI/MainnetConfirmationModal'
import { ShareButton } from './ShareButton'
import { useMainnetConfirmation } from '../hooks/useMainnetConfirmation'
import { useToast } from '../context/ToastContext'
import { stellarService } from '../services/stellar'
import { TokenDeployParams, DeploymentResult } from '../types'
import { validateTokenSymbol, validateTokenName, validateDecimals } from '../utils/validation'

export const TokenCreateForm: React.FC = () => {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimals, setDecimals] = useState('7')
  const [initialSupply, setInitialSupply] = useState('')
  const [description, setDescription] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedToken, setDeployedToken] = useState<{ address: string; name: string; symbol: string } | null>(null)

  const { showModal, tokenParams, requestDeployment, closeModal, confirmDeployment } =
    useMainnetConfirmation()
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!validateTokenName(name)) {
      addToast('Invalid token name', 'error')
      return
    }

    if (!validateTokenSymbol(symbol)) {
      addToast('Invalid token symbol', 'error')
      return
    }

    if (!validateDecimals(parseInt(decimals))) {
      addToast('Decimals must be between 0 and 18', 'error')
      return
    }

    const params: TokenDeployParams = {
      name,
      symbol,
      decimals: parseInt(decimals),
      initialSupply,
      ...(description && {
        metadata: {
          description,
          image: new File([], ''), // Placeholder - update when image upload is implemented
        },
      }),
    }

    // Request deployment - will show modal on mainnet, proceed directly on testnet
    requestDeployment(params, () => deployToken(params))
  }

  const deployToken = async (params: TokenDeployParams) => {
    setIsDeploying(true)
    try {
      const result = await stellarService.deployToken(params) as DeploymentResult
      
      if (result.success) {
        addToast('Token deployed successfully!', 'success')
        setDeployedToken({ address: result.tokenAddress, name: params.name, symbol: params.symbol })
        // Reset form
        setName('')
        setSymbol('')
        setDecimals('7')
        setInitialSupply('')
        setDescription('')
      } else {
        addToast('Token deployment failed', 'error')
      }
    } catch (error) {
      console.error('Deployment error:', error)
      addToast('An error occurred during deployment', 'error')
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <>
      {deployedToken && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">🎉</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-800 dark:text-green-300">
                {deployedToken.name} (${deployedToken.symbol}) deployed successfully!
              </p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1 font-mono break-all">
                {deployedToken.address}
              </p>
              <div className="mt-3">
                <ShareButton
                  tokenAddress={deployedToken.address}
                  tokenName={deployedToken.name}
                  tokenSymbol={deployedToken.symbol}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Token Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Token"
          required
        />

        <Input
          label="Token Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="MTK"
          required
        />

        <Input
          label="Decimals"
          type="number"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
          placeholder="7"
          min="0"
          max="18"
          required
        />

        <Input
          label="Initial Supply"
          value={initialSupply}
          onChange={(e) => setInitialSupply(e.target.value)}
          placeholder="1000000"
          required
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your token..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <Button type="submit" disabled={isDeploying}>
          {isDeploying ? 'Deploying...' : 'Deploy Token'}
        </Button>
      </form>

      {tokenParams && (
        <MainnetConfirmationModal
          isOpen={showModal}
          onClose={closeModal}
          onConfirm={confirmDeployment}
          tokenParams={tokenParams}
        />
      )}
    </>
  )
}
