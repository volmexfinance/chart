import type { Resolution, RestApiEnvironment, SymbolInfo } from './types'

// Make requests to CryptoCompare API
export async function makeApiRequest(path: string) {
  try {
    const response = await fetch(`https://min-api.cryptocompare.com/${path}`)
    return response.json()
  } catch (error: any) {
    throw new Error(`trading view datafeed request error: ${error.status}`)
  }
}

// Generate a symbol ID from a pair of the coins
export function generateSymbol(exchange: string, fromSymbol: string, toSymbol: string) {
  const short = `${fromSymbol}/${toSymbol}`
  return {
    short,
    full: `${exchange}:${short}`,
  }
}

export function parseFullSymbol(fullSymbol: string) {
  const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/)
  if (!match) {
    return null
  }

  return {
    exchange: match[1],
    fromSymbol: match[2],
    toSymbol: match[3],
  }
}
export function parseResolution(resolution: any) {
  return /^\d+$/.test(resolution) ? `${resolution}m` : resolution
}

export function getNextBarTime(resolution: Resolution) {
  const resolutionMap: { [resolution: string]: number } = {
    1: 60,
    5: 60 * 5,
    15: 60 * 15,
    60: 60 * 60,
    '1D': 60 * 60 * 24,
  }
  const timeBucket = resolutionMap[resolution] || 60
  const now = new Date()
  const nextBarTime = new Date(now.getTime() + timeBucket * 1000)
  return nextBarTime.getTime()
}



export const symbolInfoEnvironmentSelector = (symbolInfo: SymbolInfo) => {
  let environment: RestApiEnvironment | undefined = undefined;
  if (symbolInfo.full_name.includes('-green')) {
    environment = 'green'
  } else if (symbolInfo.full_name.includes('-blue')) {
    environment = 'blue'
  }
  const cleanEnvironment = (str: string) => str.replace('-green', '').replace('-blue', '')

  return {
    symbolInfo: {
      ...symbolInfo,
      full_name: cleanEnvironment(symbolInfo.full_name),
      name: cleanEnvironment(symbolInfo.name),
    } as SymbolInfo,
    environment,
  }
}