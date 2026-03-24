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
  createdAt?: number // unix seconds
  metadataUri?: string
}

export interface IPFSMetadata {
  name?: string
  description?: string
  image?: string // ipfs:// URI
  [key: string]: unknown
}

export interface AppError {
  code: string
  message: string
}

export type ContractEventType =
  | 'token_created'
  | 'tokens_minted'
  | 'tokens_burned'
  | 'metadata_set'
  | 'fees_updated'

export interface ContractEvent {
  id: string
  type: ContractEventType
  ledger: number
  timestamp: number // unix seconds
  txHash: string
  data: Record<string, string>
}

export interface GetEventsResult {
  events: ContractEvent[]
  cursor: string | null // opaque cursor for pagination
}

export interface FactoryState {
  admin: string       // Stellar account address (G...)
  treasury: string    // Stellar account address (G...)
  base_fee: bigint    // i128 — fee in stroops for token creation / minting
  metadata_fee: bigint // i128 — fee in stroops for set_metadata
  token_count: number // u32 — total tokens deployed via the factory
  paused: boolean     // whether the contract is paused
}
