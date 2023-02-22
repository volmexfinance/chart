import type { LibrarySymbolInfo } from '../charting_library/charting_library'
import { getTokenList } from '../utils'
import { subscribeOnStream, unsubscribeFromStream } from './streaming'

const lastBarsCache = new Map()

const configurationData = {
  supported_resolutions: ['1', '5', '15', '60', '1D'],
  supports_marks: false,
  supports_timescale_marks: false,
  supports_time: true,
  reset_cache_timeout: 100,
}

// https://api.thegraph.com/subgraphs/name/jonathanvolmex/perps-mumbai
/*
{
    priceCandles(first: 4) {
        open
        high
        low
        close
        timestamp
        period
    }
}
*/
type SymbolInfo = {
  name: string
  exchange: string
  full_name: string
}
export type Resolution = 1 | 5 | 15 | 60 | '1D'
async function getVolmexKlines(symbolInfo: SymbolInfo, resolution: Resolution, from: number, to: number) {
  var split_symbol = symbolInfo.name.split(/[:/]/)
  const resolutionToInterval = {
    1: '1',
    5: '5',
    15: '15',
    60: '60',
    240: '60',
    '1D': 'D',
    // ''
  }
  const symbol = split_symbol[0]
  const url = new URL(`https://rest-v1.volmex.finance/public/history`)
  url.searchParams.append('symbol', symbol)
  url.searchParams.append('resolution', resolutionToInterval[resolution]) // 1, 5, 15, 30, 60
  url.searchParams.append('from', String(from))
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

async function getPerpKlines(symbolInfo: SymbolInfo, resolution: Resolution, from: number, to: number) {
  var split_symbol = symbolInfo.name.split(/[:/]/)
  const symbolToBaseToken: { [index: string]: string } = {
    ETH: '0x24bf203aaf9afb0d4fc03001a368ceab11b92d93',
    // BTC: '0x24bf203aaf9afb0d4fc03001a368ceab11b92d93', // TODO: remove with BTC base token address
  }
  const baseToken = symbolToBaseToken[split_symbol[0]] ?? '0x24bf203aaf9afb0d4fc03001a368ceab11b92d93'
  const bars: any[] = []
  const resolutionToInterval = {
    1: '1m',
    5: '5m',
    15: '15m',
    60: '1h',
    240: '4h',
    '1D': '1d',
    // ''
  }
  let limit = 1000
  let index = 0
  while (bars.length % limit === 0) {
    const response = await fetch('https://api.thegraph.com/subgraphs/name/jonathanvolmex/perps-mumbai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query PriceCandles($from: Int!, $to: Int!, $baseToken: String!, $skip: Int!, $resolution: String!){
        priceCandles(first: 1000, where: {
          timestamp_gte: $from,
          timestamp_lt: $to
          baseToken: $baseToken,
          period: $resolution
        }
        skip: $skip) {
          baseToken
          open
          high
          low
          close
          timestamp
          period
        }
      }`,
        variables: {
          from: from,
          to: to,
          baseToken: baseToken,
          skip: index * limit,
          resolution: resolutionToInterval[resolution],
        },
      }),
    })
    const data = await response.json()
    const { priceCandles } = data.data
    if (priceCandles.length === 0) {
      break
    }

    priceCandles.forEach((candle: any) => {
      bars.push({
        open: String(candle.open / 1e8),
        high: String(candle.high / 1e8),
        low: String(candle.low / 1e8),
        close: String(candle.close / 1e8),
        time: candle.timestamp * 1000,
      })
    })
  }
  return bars
}

async function getBinanceKlines(symbolInfo: SymbolInfo, resolution: Resolution, from: number, to: number) {
  var split_symbol = symbolInfo.name.split(/[:/]/)
  const resolutionToInterval = {
    1: '1m',
    5: '5m',
    15: '15m',
    60: '1h',
    240: '4h',
    '1D': '1d',
    // ''
  }
  // TODO: Limits and getting range when zoom out more
  const qs = {
    symbol: split_symbol[0] + split_symbol[1],
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
  to: number,
  exchange: string
) {
  var split_symbol = symbolInfo.name.split(/[:/]/)
  const urlPath = resolution === '1D' ? '/data/histoday' : resolution >= 60 ? '/data/histohour' : '/data/histominute'
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

function getAllSymbols() {
  const indexAssets = getTokenList('index', 80001)

  const volmexSymbols = indexAssets.map((index) => {
    const symbol = index.symbol === 'ETH' ? 'EVIV' : 'BVIV'
    return {
      symbol: symbol,
      full_name: symbol,
      description: `${index.name} Volatility Index`,
      exchange: 'Volmex',
      type: 'crypto',
    }
  })

  const volmexSymbolsPerps: any[] = [] /*indexAssets.map((index) => ({
    symbol: index.symbol,
    full_name: index.symbol + ' Mark',
    description: `${index.name} Volatility Index`,
    exchange: 'VolmexPerps',
    type: 'crypto',
  }))*/

  const extraSymbols = [
    {
      symbol: 'ETH/USD',
      full_name: 'ETH/USD',
      description: `Ethereum USD price`,
      exchange: 'Coinbase',
      type: 'crypto',
    },
    {
      symbol: 'BTC/USD',
      full_name: 'BTC/USD',
      description: `Bitcoin USD price`,
      exchange: 'Coinbase',
      type: 'crypto',
    },
  ]

  return volmexSymbols.concat(extraSymbols as any).concat(volmexSymbolsPerps)
}

export default {
  onReady: (callback: (s: any) => void) => {
    console.log('[onReady]: Method call')
    setTimeout(() => callback(configurationData))
  },

  searchSymbols: async (userInput: any, exchange: any, symbolType: any, onResultReadyCallback: any) => {
    console.log('[searchSymbols]: Method call')
    const symbols = await getAllSymbols()
    const newSymbols = symbols.filter((symbol) => {
      const isExchangeValid = exchange === '' || symbol.exchange === exchange
      const isFullSymbolContainsInput = symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1
      return isExchangeValid && isFullSymbolContainsInput
    })
    onResultReadyCallback(newSymbols)
  },

  resolveSymbol: async (
    symbolName: string,
    onSymbolResolvedCallback: (s: any) => void,
    onResolveErrorCallback: (s: any) => void
  ) => {
    const symbols = await getAllSymbols()
    const symbolItem = symbols.find(({ full_name }) => full_name === symbolName)
    console.log('[resolveSymbol]: Method call', symbolName, symbolItem?.exchange)
    if (!symbolItem) {
      console.log('[resolveSymbol]: Cannot resolve symbol', symbolName)
      onResolveErrorCallback('cannot resolve symbol')
      return
    }

    console.log('symbolName', symbolName)

    const symbolInfo: LibrarySymbolInfo = {
      ticker: symbolName,
      name: symbolItem.symbol,
      description: symbolItem.description,
      type: symbolItem.type,
      session: '24x7',
      // timezone: 'Etc/UTC',
      exchange: symbolItem.exchange,
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: true,
      has_weekly_and_monthly: false,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: 'pulsed',
    }

    console.log('[resolveSymbol]: Symbol resolved', symbolName)
    onSymbolResolvedCallback(symbolInfo)
  },

  getBars: async (
    symbolInfo: SymbolInfo,
    resolution: Resolution,
    periodParams: any,
    onHistoryCallback: (s: any, options: any) => void,
    onErrorCallback: (s: any) => void
  ) => {
    console.log({ resolution })
    const { from: unsafeFrom, to, firstDataRequest } = periodParams
    const from = Math.max(0, unsafeFrom)
    const { exchange } = symbolInfo
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to)
    console.log('symbol info', symbolInfo)
    if (exchange === 'VolmexPerps') {
      const bars = await getPerpKlines(symbolInfo, resolution, from, to)
      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, {
          ...bars[bars.length - 1],
        })
      }
      const counter = lastBarsCache.get(symbolInfo.full_name + '_' + resolution)?.counter || 0

      onHistoryCallback(bars, { noData: counter > 5 && bars.length > 0 ? false : true })
      console.log(`[getBars]: returned ${bars.length} bar(s)`)
    } else if (exchange === 'Volmex') {
      try {
        const bars = await getVolmexKlines(symbolInfo, resolution, from, to)
        const lastBarLen = lastBarsCache.get(symbolInfo.full_name)?.barsLen || bars.length
        const keepBrowsing = lastBarsCache.get(symbolInfo.full_name)?.keepBrowsing
        const counter = lastBarsCache.get(symbolInfo.full_name)?.counter || 0

        console.log('bars', bars.length)
        console.log('lastBarLen', lastBarLen)

        // counter++

        if (counter === 1000) {
          console.log('death loop triggered, calling back with empty array')
          onHistoryCallback([], { noData: true })

          lastBarsCache.set(symbolInfo.full_name, {
            counter: counter + 1,
            keepBrowsing: false,
          })
        } else if (firstDataRequest && keepBrowsing) {
          onHistoryCallback(bars, { noData: false })

          lastBarsCache.set(symbolInfo.full_name, {
            keepBrowsing: true,
            counter: counter + 1,
            barsLen: bars.length,
            ...bars[bars.length - 1],
          })
        } else if (bars.length && keepBrowsing) {
          onHistoryCallback(bars, { noData: false })

          lastBarsCache.set(symbolInfo.full_name, {
            keepBrowsing: bars.length >= lastBarLen,
            barsLen: bars.length,
            counter: counter + 1,
            ...bars[bars.length - 1],
          })
        } else {
          lastBarsCache.set(symbolInfo.full_name, {
            keepBrowsing: false,
            counter: counter + 1,
          })
          onHistoryCallback(bars, { noData: true })
        }

        console.log(`[getBars]: returned ${bars.length} bar(s)`)

        return bars
      } catch (error) {
        console.log('[getBars]: Get error', error)
        onErrorCallback(error)
      }
    } else {
      try {
        const bars = await getBinanceKlines(symbolInfo, resolution, from, to) //await getPerpKlines(symbolInfo, resolution, from, to)
        if (firstDataRequest) {
          lastBarsCache.set(symbolInfo.full_name, {
            ...bars[bars.length - 1],
          })
        }

        onHistoryCallback(bars, { noData: bars.length === 0 ? true : false })
        console.log(`[getBars]: returned ${bars.length} bar(s)`)
      } catch (error) {
        console.log('[getBars]: Get error for binance.us falling back to cryptocompare:', error)
        try {
          const bars = await getCryptoCompareKlines(symbolInfo, resolution, from, to, exchange)
          if (firstDataRequest) {
            lastBarsCache.set(symbolInfo.full_name, {
              ...bars[bars.length - 1],
            })
          } else {
            onHistoryCallback([], { noData: true })
          }
          console.log(`[getBars]: returned ${bars.length} bar(s)`)

          onHistoryCallback(bars, {
            noData: false,
          })
          // })
        } catch (error) {
          console.log('[getBars]: Get error', error)
          onErrorCallback(error)
        }
        // console.log('[getBars]: Get error', error)
        // onErrorCallback(error)
      }
    }

    return
  },

  subscribeBars: (
    symbolInfo: SymbolInfo,
    resolution: Resolution,
    onRealtimeCallback: (s: any) => void,
    subscribeUID: string,
    onResetCacheNeededCallback: (s: any) => void
  ) => {
    console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID)
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscribeUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.full_name)
    )
  },

  unsubscribeBars: (subscriberUID: string) => {
    console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID)
    unsubscribeFromStream(subscriberUID)
  },
}
