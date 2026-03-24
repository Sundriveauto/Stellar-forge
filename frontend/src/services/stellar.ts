import {
  Account,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  rpc,
  nativeToScVal,
  scValToNative,
  xdr,
} from 'stellar-sdk'
import { STELLAR_CONFIG } from '../config/stellar'

interface FactoryState {
  token_count: number
}

export interface FactoryTokenInfo {
  index: number
  name: string
  symbol: string
  decimals: number
  creator: string
  createdAt: number
  tokenAddress: string
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string') return Number(value)
  return 0
}

const toString = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'toString' in value) {
    return String(value)
  }
  return ''
}

const getNetworkPassphrase = (): string => {
  return STELLAR_CONFIG.network === 'mainnet'
    ? Networks.PUBLIC
    : Networks.TESTNET
}

const getExplorerBaseUrl = (): string => {
  return STELLAR_CONFIG.network === 'mainnet'
    ? 'https://stellar.expert/explorer/public'
    : 'https://stellar.expert/explorer/testnet'
}

export class StellarService {
  private rpcServer = new rpc.Server(
    STELLAR_CONFIG[STELLAR_CONFIG.network as 'testnet' | 'mainnet'].sorobanRpcUrl
  )

  private async invokeFactoryView(
    method: string,
    args: xdr.ScVal[],
    sourceAddress: string
  ): Promise<unknown> {
    const factoryContractId = STELLAR_CONFIG.factoryContractId

    if (!factoryContractId) {
      throw new Error('Factory contract ID is missing. Configure VITE_FACTORY_CONTRACT_ID.')
    }

    const source = new Account(sourceAddress, '0')
    const contract = new Contract(factoryContractId)
    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build()

    const simulation = await this.rpcServer.simulateTransaction(tx)

    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error(simulation.error)
    }

    const result = simulation.result?.retval
    if (!result) {
      throw new Error(`No return value from ${method}`)
    }

    return scValToNative(result)
  }

  async getFactoryState(sourceAddress: string): Promise<FactoryState> {
    const state = (await this.invokeFactoryView('get_state', [], sourceAddress)) as Record<
      string,
      unknown
    >

    return {
      token_count: toNumber(state.token_count),
    }
  }

  async getTokenInfoByIndex(index: number, sourceAddress: string): Promise<FactoryTokenInfo> {
    const rawInfo = (await this.invokeFactoryView(
      'get_token_info',
      [nativeToScVal(index, { type: 'u32' })],
      sourceAddress
    )) as Record<string, unknown>

    return {
      index,
      name: toString(rawInfo.name),
      symbol: toString(rawInfo.symbol),
      decimals: toNumber(rawInfo.decimals),
      creator: toString(rawInfo.creator),
      createdAt: toNumber(rawInfo.created_at),
      tokenAddress: toString(rawInfo.token_address ?? rawInfo.address ?? rawInfo.token),
    }
  }

  async getTokensByCreator(sourceAddress: string): Promise<FactoryTokenInfo[]> {
    const state = await this.getFactoryState(sourceAddress)
    if (!state.token_count) {
      return []
    }

    const tokenRequests = Array.from({ length: state.token_count }, (_, idx) =>
      this.getTokenInfoByIndex(idx + 1, sourceAddress).catch(() => null)
    )

    const tokens = (await Promise.all(tokenRequests)).filter(
      (token): token is FactoryTokenInfo =>
        token !== null && token.creator.toLowerCase() === sourceAddress.toLowerCase()
    )

    return tokens.sort((a, b) => b.createdAt - a.createdAt)
  }

  async getTokenInfo(tokenAddress: string): Promise<Record<string, unknown>> {
    return { tokenAddress }
  }

  getExplorerContractUrl(contractAddress: string): string {
    return `${getExplorerBaseUrl()}/contract/${contractAddress}`
  }
}

export const stellarService = new StellarService()