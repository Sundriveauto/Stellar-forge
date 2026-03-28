// TypeScript type definitions

export interface TokenDeployParams {
  name: string
  symbol: string
  decimals: number
  initialSupply: string
  metadata?: {
    image: File
    description: string
  }
}

export interface DeploymentResult {
  tokenAddress: string
  transactionHash: string
  success: boolean
}

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  creator: string
}

export interface AppError {
  code: string
  message: string
}

export interface BurnParams {
  tokenAddress: string
  from: string
  amount: string
}

export interface BurnResult {
  transactionHash: string
  success: boolean
  newTotalSupply?: string
}

export type SortOrder = 'newest' | 'oldest' | 'alphabetical'