import type { LibrarySymbolInfo, ResolutionString } from '../charting_library/charting_library'
import { getTokenList } from '../utils'
import api from './api'
import { subscribeOnStream, unsubscribeFromStream } from './streaming'
import { getAllSymbols } from './symbols'
import type { Resolution, SymbolInfo } from './types'

const lastBarsCache = new Map()

const configurationData = {
  supported_resolutions: ['1', '5', '15', '60', '1D'],
  supports_marks: false,
  supports_timescale_marks: false,
  supports_time: true,
  reset_cache_timeout: 100,
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
      if (!isExchangeValid) return false
      const isFullSymbolContainsInput = symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1
      const isDescriptionContainsInput = symbol.description.toLowerCase().indexOf(userInput.toLowerCase()) !== -1
      const isExchangeContainsInput = symbol.exchange.toLowerCase().indexOf(userInput.toLowerCase()) !== -1
      return isFullSymbolContainsInput || isDescriptionContainsInput || isExchangeContainsInput
    })
    onResultReadyCallback(newSymbols)
  },

  resolveSymbol: async (
    symbolName: string,
    onSymbolResolvedCallback: (s: any) => void,
    onResolveErrorCallback: (s: any) => void
  ) => {
    const symbols = await getAllSymbols()
    console.log({ symbols })
    const symbolItem = symbols.find(({ symbol }) => symbol === symbolName)
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
      supported_resolutions: configurationData.supported_resolutions as ResolutionString[],
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
      const bars = await api.getPerpKlines(symbolInfo, resolution, from, to)
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
        const bars = await api.getVolmexKlines(symbolInfo, resolution, from, to)
        if (firstDataRequest) {
          lastBarsCache.set(symbolInfo.full_name, {
            ...bars[bars.length - 1],
          })
        }

        onHistoryCallback(bars, { noData: bars.length === 0 ? true : false })
        console.log(`[getBars]: returned ${bars.length} bar(s)`)
      } catch (error) {
        console.log('[getBars]: Get error', error)
        onErrorCallback(error)
      }
    } else {
      try {
        const bars = await api.getBinanceKlines(symbolInfo, resolution, from, to) //await getPerpKlines(symbolInfo, resolution, from, to)
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
          const bars = await api.getCryptoCompareKlines(symbolInfo, resolution, from, to, exchange)
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
    if (!(symbolInfo.name === 'EVIV' || symbolInfo.name === 'BVIV')) return
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
