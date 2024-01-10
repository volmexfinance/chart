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
export type Resolution = 1 | 5 | 15 | 60 | '1D'
async function getVolmexKlines(symbolInfo: LibrarySymbolInfo, resolution: Resolution, from: number, to: number) {
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
  const url = new URL(`https://rest-v1.volmex.finance/public/iv/history`)
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

async function getPerpKlines(symbolInfo: LibrarySymbolInfo, resolution: Resolution, from: number, to: number) {
  const { ticker } = symbolInfo

  const tickerToConfig: {
    [key: string]: {
      url: string
      symbolToBaseToken: { [index: string]: string }
    }
  } = {
    'Arbitrum Sepolia Staging': {
      url: 'https://api.thegraph.com/subgraphs/name/jonathanvolmex/perps-arbitrum-staging',
      symbolToBaseToken: {
        EVIV: '0x3e16c66bdD8b6f93807275434893d2DA1BD35437',
        BVIV: '0x596a79a441Ad4cc3eC56a59c251298B6aEb5F444', // TODO: remove with BTC base token address
        ETH: '0x183D38e9C7bE4a71cf85F38562b81542a0259C4D',
        BTC: '0xC533f7D0A98E29566d58A3aFF9Fc3ab094DFd9fA',
      },
    },
    'Base Goerli Staging': {
      url: 'https://api.studio.thegraph.com/query/51896/perps-base-staging/version/latest',
      symbolToBaseToken: {
        EVIV: '0x290e1217D0a766d8045cC89F2f474B5C056bCbec',
        BVIV: '0x589ECc36b74A82d86D6Fd02ce92EAcC7290f0f52', // TODO: remove with BTC base token address
        ETH: '0x5AC05f40b33348A94de36dA1b18358C4E9CD2E26',
        BTC: '0xAAA60b5a68962971786912e34811ACe216e5af77',
      },
    },
    'Arbitrum Sepolia Testnet': {
      url: 'https://api.thegraph.com/subgraphs/name/jonathanvolmex/perps-arbitrum-testnet-2',
      symbolToBaseToken: {
        EVIV: '0x4c88C3FBc04717bf191F327B906554219C9F5086',
        BVIV: '0x0E985966b546EC86304Be0780ECfD2fe2bBf849c', // TODO: remove with BTC base token address
        ETH: '0xBfcf08E51Fa2E23C371a1bE213B39D07C5192014',
        BTC: '0xD81F9c7230354d395dCdc9e3403948263fD46a58',
      },
    },
    'Base Goerli Testnet': {
      url: 'https://api.studio.thegraph.com/query/51896/perps-base-testnet-2/version/latest',
      symbolToBaseToken: {
        EVIV: '0xd4eF7A69971D660660ff792d97663aEF9aAf210e',
        BVIV: '0x58f046e01D7064a50067c876a52E4622fe859643', // TODO: remove with BTC base token address
        ETH: '0xEC2B99D116b6d0baD017d607Dc285342353D6D5c',
        BTC: '0xCbBb1f0B796c7FA2DafB8E1C2E394Aa7082fB2B7',
      },
    },
  }
  let config
  for (const key in tickerToConfig) {
    if (symbolInfo.name.includes(key)) {
      config = tickerToConfig[key]
      break
    }
    throw 'no config found'
  }

  var split_symbol = symbolInfo.name.split(/[:/]/)
  console.log({ symbolInfo, split_symbol, ticker })
  const baseToken = config!.symbolToBaseToken[split_symbol[0]]
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
    const response = await fetch(config!.url, {
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

async function getBinanceKlines(symbolInfo: LibrarySymbolInfo, resolution: Resolution, from: number, to: number) {
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
  symbolInfo: LibrarySymbolInfo,
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

  // assuming if REACT_APP_ENABLED_CHAIN_IDS is set, then we want to show perps symbols
  const volmexSymbolsPerps: any[] = []
  if (process.env.REACT_APP_ENABLED_CHAIN_IDS != undefined) {
    volmexSymbolsPerps.push(
      ...[{ symbol: 'EVIV:PERP' }, { symbol: 'BVIV:PERP' }, { symbol: 'ETH:PERP' }, { symbol: 'BTC:PERP' }].flatMap(
        (index) =>
          (process.env.REACT_APP_ENABLED_CHAIN_IDS as string).split(',').flatMap((chainId) => [
            {
              symbol: index.symbol,
              full_name: index.symbol + ':' + chainId + ':LAST_PRICE',
              description: `${index.symbol} Perpetuals ${chainId} Last Price`,
              exchange: 'VolmexPerps',
              type: 'crypto',
            },
            {
              symbol: index.symbol,
              full_name: index.symbol + ':' + chainId + ':MARK_PRICE',
              description: `${index.symbol} Perpetuals ${chainId} Mark Price`,
              exchange: 'VolmexPerps',
              type: 'crypto',
            },
          ])
      )
    )
  }

  console.log('volmexSymbolsPerps', volmexSymbolsPerps)
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
      // @ts-ignore
      supported_resolutions: configurationData.supported_resolutions,
      has_empty_bars: true,
      volume_precision: 2,
      data_status: 'pulsed',
    }

    console.log('[resolveSymbol]: Symbol resolved', symbolName)
    onSymbolResolvedCallback(symbolInfo)
  },

  getBars: async (
    symbolInfo: LibrarySymbolInfo,
    resolution: Resolution,
    periodParams: any,
    onHistoryCallback: (s: any, options: any) => void,
    onErrorCallback: (s: any) => void
  ) => {
    console.log({ resolution })
    const { from: unsafeFrom, to, firstDataRequest } = periodParams
    const from = Math.max(0, unsafeFrom)
    const { exchange } = symbolInfo
    console.log(
      '[getBars]: Method call',
      symbolInfo,
      resolution,
      from,
      to,
      new Date(from * 1000).toLocaleDateString(),
      new Date(to * 1000).toLocaleDateString()
    )
    console.log('symbol info', symbolInfo)
    if (exchange === 'VolmexPerps') {
      const bars = await getPerpKlines(symbolInfo, resolution, from, to)
      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, {
          ...bars[bars.length - 1],
        })
      }
      const id = symbolInfo.full_name + '_' + resolution
      let lastBar = lastBarsCache.get(id)
      if (!lastBar) {
        lastBar = {
          counter: 0,
        }
        lastBarsCache.set(id, lastBar)
      } else {
        lastBarsCache.set(id, {
          counter: lastBar.counter + 1,
        })
      }
      console.log({ counter: lastBar.counter })
      onHistoryCallback(bars, { noData: bars.length == 0 && lastBar.counter > 5 })
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
        throw 'binance down'
        console.log('binance')
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
    symbolInfo: LibrarySymbolInfo,
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
