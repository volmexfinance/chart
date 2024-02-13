import { ChainId } from './chainIds'
import { apiBaseUrl } from './constants'
import { getChainIdRelayer } from './helpers'
import type { Bar, Resolution, SymbolInfo } from './types'
import { VOLMEX_API_CONSTANTS } from './volmexApiHelpers'

async function getVolmexKlines(
  symbolInfo: SymbolInfo,
  resolution: Resolution,
  from: number,
  to: number
): Promise<Bar[]> {
  var split_symbol = symbolInfo.name.split(/[:/]/)
  const { resolutionToInterval, calculateBack3Days, calculateBack40Days, calculateBack1000Days } = VOLMEX_API_CONSTANTS
  const symbol = split_symbol[0]

  const getBaseSymbol = (symbolInfo: SymbolInfo) => {
    // current naming conventions in volmex docs use E for ETH and B for BTC as the first letter of the symbol
    console.log({ symbolInfoBTC: symbolInfo })
    if (symbolInfo.name[0] === 'E') {
      return 'ETH'
    } else if (symbolInfo.name[0] === 'B' && !symbolInfo.name.includes('BNB')) {
      return 'BTC'
    } else {
      const trySymbolVIV = symbolInfo.name.split('VIV').length > 1 && symbolInfo.name.split('VIV')[0]
      const trySymbolVCORR = symbolInfo.name.split('VCORR').length > 1 && symbolInfo.name.split('VCORR')[0]
      const trySymbolVRV = symbolInfo.name.split('VRV').length > 1 && symbolInfo.name.split('VRV')[0]
      const trySymbolVRP = symbolInfo.name.split('VRP').length > 1 && symbolInfo.name.split('VRP')[0]
      const trySymbol = trySymbolVIV || trySymbolVCORR || trySymbolVRV || trySymbolVRP
      if (!trySymbol) {
        throw 'Could not get base symbol'
      }
      console.log({ trySymbol })
      return trySymbol
    }
    return symbolInfo.name[0] === 'E' ? 'ETH' : 'BTC'
  }
  const getUrlString = (symbolInfo: SymbolInfo) => {
    if (symbolInfo.name.includes('VIV')) {
      const url = new URL(`${apiBaseUrl}/public/iv/history`)
      url.searchParams.append('symbol', symbol)
      return url.toString()
    } else if (symbolInfo.name.includes('VRV')) {
      const url = new URL(`${apiBaseUrl}/public/rv/history`)
      url.searchParams.append('symbol', getBaseSymbol(symbolInfo))
      if (symbolInfo.name.includes('VRV1D')) {
        url.searchParams.append('type', 'rv_01')
      } else if (symbolInfo.name.includes('VRV3D')) {
        url.searchParams.append('type', 'rv_03')
      } else if (symbolInfo.name.includes('VRV1W')) {
        url.searchParams.append('type', 'rv_07')
      } else if (symbolInfo.name.includes('VRV2W')) {
        url.searchParams.append('type', 'rv_14')
      } else if (symbolInfo.name.includes('VRV1M')) {
        url.searchParams.append('type', 'rv_30')
      } else if (symbolInfo.name.includes('VRV2M')) {
        url.searchParams.append('type', 'rv_60')
      } else if (symbolInfo.name.includes('VRV3M')) {
        url.searchParams.append('type', 'rv_90')
      } else {
        console.error('Could not get VRV type', {
          symbolInfo,
        })
        throw 'Could not get VRV type'
      }
      return url.toString()
    } else if (symbolInfo.name.includes('VRP')) {
      const url = new URL(`${apiBaseUrl}/public/rv/history`)
      url.searchParams.append('type', 'vrp')
      url.searchParams.append('symbol', getBaseSymbol(symbolInfo))
      return url.toString()
    } else if (symbolInfo.name.includes('VCORR')) {
      const url = new URL(`${apiBaseUrl}/public/vcorr/history`)
      if (symbolInfo.name.includes('VCORR3D')) {
        url.searchParams.append('type', 'vcorr_03d01h')
        url.searchParams.append('symbol', getBaseSymbol(symbolInfo))
      } else if (symbolInfo.name.includes('VCORR1W')) {
        url.searchParams.append('type', 'vcorr_07d02h')
        url.searchParams.append('symbol', getBaseSymbol(symbolInfo))
      } else if (symbolInfo.name.includes('VCORR2W')) {
        url.searchParams.append('type', 'vcorr_14d04h')
        url.searchParams.append('symbol', getBaseSymbol(symbolInfo))
      } else if (symbolInfo.name.includes('VCORR1M')) {
        url.searchParams.append('type', 'vcorr_30d06h')
        url.searchParams.append('symbol', getBaseSymbol(symbolInfo))
      } else if (symbolInfo.name.includes('VCORR2M')) {
        url.searchParams.append('type', 'vcorr_60d12h')
        url.searchParams.append('symbol', getBaseSymbol(symbolInfo))
      } else if (symbolInfo.name.includes('VCORR3M')) {
        url.searchParams.append('type', 'vcorr_90d24h')
        url.searchParams.append('symbol', getBaseSymbol(symbolInfo))
      } else {
        url.searchParams.append('type', 'vcorr_03d01h')
        console.error('Unknown symbolInfo.name', symbolInfo.name)
      }
      return url.toString()
    } else {
      console.error('Unknown symbolInfo.name', symbolInfo.name)
    }
    // error default
    return `${apiBaseUrl}/public/iv/history`
  }
  const urlString = getUrlString(symbolInfo)

  const url = new URL(urlString)
  url.searchParams.append('resolution', resolutionToInterval[resolution]) // 1, 5, 15, 30, 60
  url.searchParams.append(
    'from',
    String(
      resolution === '1' || resolution === '5' || resolution === '15'
        ? calculateBack3Days(to)
        : resolution === '60'
        ? calculateBack40Days(to)
        : resolution === '1D'
        ? calculateBack1000Days(to)
        : from
    )
  )
  url.searchParams.append('to', String(to))
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  })
  const data = await response.json()

  const bars = data.t.map((timestamp: any, i: number) => {
    return {
      time: timestamp * 1000,
      low: data.l[i],
      high: data.h[i],
      open: data.o[i],
      close: data.c[i],
      volume: data.v[i],
    }
  })

  return bars
}

async function getPerpKlines(symbolInfo: SymbolInfo, resolution: Resolution, from: number, to: number): Promise<Bar[]> {
  // @ts-ignore
  const { ticker } = symbolInfo
  if (!ticker) {
    throw 'no ticker'
  }
  const [symbol, _, _chainId, priceType] = ticker.split(':') as [string, string, string, 'LAST_PRICE' | 'MARK_PRICE']
  const getUrlString = (token: string) => {
    const chainIdRelayer = getChainIdRelayer(chainId)
    const baseUrl = process.env.REACT_APP_PERPS_API_URL
    return `${baseUrl}/api/v1/perpetuals/${
      priceType == 'LAST_PRICE' ? 'last' : 'mark'
    }_prices_history/${chainIdRelayer}/${token}`
  }
  const chainId = Number(_chainId)
  const tokenAddr = {
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
  }[chainId as ChainId.ArbitrumSepolia | ChainId.BaseSepolia][symbol as 'EVIV' | 'BVIV' | 'ETH' | 'BTC']

  const { resolutionToInterval, calculateBack3Days, calculateBack40Days, calculateBack1000Days } = VOLMEX_API_CONSTANTS

  const urlString = getUrlString(tokenAddr)
  const url = new URL(urlString)
  url.searchParams.append('resolution', resolutionToInterval[resolution]) // 1, 5, 15, 30, 60
  url.searchParams.append(
    'from',
    String(
      resolution === '1' || resolution === '5' || resolution === '15'
        ? calculateBack3Days(to)
        : resolution === '60'
        ? calculateBack40Days(to)
        : resolution === '1D'
        ? calculateBack1000Days(to)
        : from
    )
  )
  url.searchParams.append('to', String(to))

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  })
  const data = await response.json()

  const bars = data.t.map((timestamp: any, i: number) => {
    return {
      time: timestamp * 1000,
      low: data.l[i],
      high: data.h[i],
      open: data.o[i],
      close: data.c[i],
      volume: 0, //data.v[i],
    }
  })

  return bars
}

async function getBinanceKlines(
  symbolInfo: SymbolInfo,
  resolution: Resolution,
  from: number,
  to: number
): Promise<Bar[]> {
  var split_symbol = symbolInfo.name.split(/[:/]/)
  const resolutionToInterval = {
    '1': '1m',
    '5': '5m',
    '15': '15m',
    '60': '1h',
    '240': '4h',
    '1D': '1d',
    // ''
  }
  // TODO: Limits and getting range when zoom out more
  const qs = {
    symbol: split_symbol[0] + (split_symbol[1] === 'USD' ? 'USDT' : split_symbol[1]),
    interval: resolutionToInterval[resolution] ? resolutionToInterval[resolution] : '15m',
    startTime: (from * 1000).toString(),
    endTime: (to * 1000).toString(),
    limit: (1000).toString(), //max is 1000 for binance
  }
  let bars = []
  while (true) {
    const url = `https://api.binance.us/api/v3/uiKlines?${new URLSearchParams(qs)}`
    const response = await fetch(url)
    const data = await response.json()
    if (data && data.code === 0) {
      // console.log('Binance API error:',data)
      return []
    }
    if (data.length === 0) {
      break
    }
    bars.push(
      ...data.map((el: any) => {
        return {
          time: el[0],
          low: el[3],
          high: el[2],
          open: el[1],
          close: el[4],
          volume: el[5],
        }
      })
    )
    if (data.length === qs.limit) {
      // if max entries found then keep
      const lastTime = bars[bars.length - 1].time
      qs.startTime = lastTime + 1
    } else {
      break
    }
  }
  return bars
}

async function getCryptoCompareKlines(
  symbolInfo: SymbolInfo,
  resolution: Resolution,
  from: number,
  to: number
): Promise<Bar[]> {
  var split_symbol = symbolInfo.name.split(/[:/]/)
  const { exchange } = symbolInfo

  const urlPath = resolution === '1D' ? '/data/histoday' : resolution == '60' ? '/data/histohour' : '/data/histominute'
  const qs = {
    e: exchange,
    fsym: split_symbol[0],
    tsym: split_symbol[1],
    toTs: to ? to.toString() : '',
    // limit: 2000,
    // aggregate: 1//resolution
  }

  const url = `https://min-api.cryptocompare.com${urlPath}?${new URLSearchParams(qs)}`
  const response = await fetch(url)
  const data = await response.json()
  if ((data.Response && data.Response === 'Error') || !data.Data.length) {
    // console.log('CryptoCompare API error:',data.Message)
    return []
  }
  var bars = data.Data.map((el: any) => {
    return {
      time: el.time * 1000, //TradingView requires bar time in ms
      low: el.low,
      high: el.high,
      open: el.open,
      close: el.close,
      volume: el.volumefrom,
    }
  })
  return bars
}

type FetchKlines = (symbolInfo: SymbolInfo, resolution: Resolution, from: number, to: number) => Promise<Bar[]>

function middleware(fetchKlines: FetchKlines): FetchKlines {
  return async (symbolInfo: SymbolInfo, resolution: Resolution, from: number, to: number): Promise<Bar[]> => {
    let oldestBarTimestamp = to
    let bars: Array<Bar> = []
    // assumes that each fetch returns the bars closer on the `to` over the `from` range
    let deathspiral = 0
    let lastWasOnlyOne = false
    while (true) {
      console.log('fetch loop')
      const _bars = await fetchKlines(symbolInfo, resolution, from, oldestBarTimestamp)
      if (_bars.length === 0 || lastWasOnlyOne) {
        break
      }

      // fixes edge case where the last bar timestamp is greater than the (from timestamp + resolution)
      //which can occur when there is not enough data to show bars for the complete range
      if (_bars.length === 1) {
        lastWasOnlyOne = true
      }
      deathspiral++
      if (deathspiral > 100) {
        console.error('deathspiral activated')
        break
      }
      bars = _bars.concat(bars)
      oldestBarTimestamp = Math.floor(_bars[0].time / 1000)
      console.log({
        oldestBarTimestamp,
        from,
        _bars,
      })
      const resolutionToInterval = {
        '1': 60,
        '5': 300,
        '15': 900,
        '60': 3600,
        '240': 14400,
        '1D': 86400,
      }
      if (oldestBarTimestamp - resolutionToInterval[resolution] <= from) {
        break
      }
    }
    return bars
  }
}

const api: {
  [fnName: string]: FetchKlines
} = {
  getVolmexKlines: middleware(getVolmexKlines),
  getBinanceKlines: middleware(getBinanceKlines),
  getCryptoCompareKlines: getCryptoCompareKlines,
  getPerpKlines: middleware(getPerpKlines),
}

export default api
