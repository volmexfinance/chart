import type { LibrarySymbolInfo, ResolutionString } from '../charting_library/charting_library'
import { getTokenList } from '../utils'
import api from './api'
import { subscribeOnStream, unsubscribeFromStream } from './streaming'
import { getAllSymbols } from './symbols'
import type { Resolution, SymbolInfo } from './types'

const lastBarsCache = new Map()
window.lastBarsCache = lastBarsCache

const configurationData = {
  supported_resolutions: ['1', '5', '15', '60', '1D'],
  supports_marks: false,
  supports_timescale_marks: false,
  supports_time: true,
  reset_cache_timeout: 100,
}

let firstDataRequestCache = new Map()

class TradingViewDatafeed {
  private isUsdChart = false

  onReady(callback: (s: any) => void) {
    console.log('[onReady]: Method call')
    setTimeout(() => callback(configurationData))
  }

  async searchSymbols(userInput: any, exchange: any, symbolType: any, onResultReadyCallback: any) {
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
  }

  async resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (s: any) => void,
    onResolveErrorCallback: (s: any) => void
  ) {
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

    if (symbolName.split('/')[1] === 'USD') {
      this.isUsdChart = true
    }

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
  }

  async getBars(
    symbolInfo: SymbolInfo,
    resolution: Resolution,
    periodParams: any,
    onHistoryCallback: (s: any, options: any) => void,
    onErrorCallback: (s: any) => void
  ) {
    const { from: unsafeFrom, to, firstDataRequest } = periodParams

    const from = Math.max(0, unsafeFrom)
    const { exchange } = symbolInfo
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to)
    console.log('symbol info', symbolInfo)
    console.log('isUsdChart', this.isUsdChart)

    const fromMs = from * 1000
    const toMs = to * 1000

    // Get the current time and the time seven days ago
    const now = new Date().getTime()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

    // if (symbolInfo.name.split('/')[1] === 'USD') {
    //   isUsdChart = true
    // }

    if (fromMs < sevenDaysAgo && (resolution === '15' || resolution === '5' || resolution === '1') && this.isUsdChart) {
      onHistoryCallback([], { noData: true })
      return
    }

    if (symbolInfo.name === 'TVIV') {
      try {
        const bars = await api.getTVIVKlines(symbolInfo, resolution, from, to)
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
    } else if (symbolInfo.name === 'DVIV') {
      try {
        const bars = await api.getDVIVKlines(symbolInfo, resolution, from, to)
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
    } else if (symbolInfo.name === 'MVIV') {
      try {
        const bars = await api.getMVIVKlines(symbolInfo, resolution, from, to)
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
    } else if (symbolInfo.name.indexOf('VBR') == 1) {
      try {
        const bars = await api.getVBRKlines(symbolInfo, resolution, from, to)
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
    } else if (exchange === 'VolmexPerps') {
      const bars = await api.getPerpKlines(symbolInfo, resolution, from, to)
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
      // try {
      //   const bars = await api.getBinanceKlines(symbolInfo, resolution, from, to) //await getPerpKlines(symbolInfo, resolution, from, to)
      //   if (firstDataRequest) {
      //     lastBarsCache.set(symbolInfo.full_name, {
      //       ...bars[bars.length - 1],
      //     })
      //   }
      //   if (firstDataRequest && bars.length === 0) {
      //     throw 'no data'
      //   }
      //   onHistoryCallback(bars, { noData: bars.length === 0 ? true : false })
      //   console.log(`[getBars]: returned ${bars.length} bar(s)`)
      // } catch (error) {
      //   console.log('[getBars]: Get error for binance.us falling back to cryptocompare:', error)
      try {
        const bars = await api.getCryptoCompareKlines(symbolInfo, resolution, from, to, exchange)
        if (firstDataRequest) {
          lastBarsCache.set(symbolInfo.full_name, {
            ...bars[bars.length - 1],
          })
        }
        console.log(`[getBars]: returned ${bars.length} bar(s)`)
        onHistoryCallback(bars, {
          noData: bars.length === 0 ? true : false,
        })
        // })
      } catch (error) {
        console.log('[getBars]: Get error', error)
        onErrorCallback(error)
      }
      // console.log('[getBars]: Get error', error)
      // onErrorCallback(error)
      // }
    }

    return
  }

  subscribeBars(
    symbolInfo: SymbolInfo,
    resolution: Resolution,
    onRealtimeCallback: (s: any) => void,
    subscribeUID: string,
    onResetCacheNeededCallback: (s: any) => void
  ) {
    return
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
  }

  unsubscribeBars(subscriberUID: string) {
    console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID)
    unsubscribeFromStream(subscriberUID)
  }
}

export default TradingViewDatafeed
