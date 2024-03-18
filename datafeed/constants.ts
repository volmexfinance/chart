import { ChainId } from './chainIds'

export const apiBaseUrl =
  typeof window !== `undefined` && window.location.hostname.includes('volmex.finance')
    ? 'https://rest-v1.volmex.finance'
    : 'https://test-api.volmex.finance'

export const isPerpsApp = () => {
  return !!process.env.REACT_APP_PERPS_API_URL
}

export const getPerpsTokenAddr = (
  chainId: ChainId.ArbitrumSepolia | ChainId.BaseSepolia,
  symbol: 'EVIV' | 'BVIV' | 'ETH' | 'BTC'
) => {
  return {
    [ChainId.ArbitrumSepolia]: {
      EVIV: process.env.REACT_APP_ARBITRUM_EVIV!,
      BVIV: process.env.REACT_APP_ARBITRUM_BVIV!, // TODO: remove with BTC base token address
      ETH: process.env.REACT_APP_ARBITRUM_ETHUSD!,
      BTC: process.env.REACT_APP_ARBITRUM_BTCUSD!,
    },
    [ChainId.BaseSepolia]: {
      EVIV: process.env.REACT_APP_BASE_EVIV!,
      BVIV: process.env.REACT_APP_BASE_BVIV!, // TODO: remove with BTC base token address
      ETH: process.env.REACT_APP_BASE_ETHUSD!,
      BTC: process.env.REACT_APP_BASE_BTCUSD!,
    },
  }[chainId][symbol]
}

export const getPerpsUrl = () => {
    const baseUrl = process.env.REACT_APP_PERPS_API_URL
    if (!baseUrl) throw 'REACT_APP_PERPS_API_URL not set'
    return baseUrl as string
}