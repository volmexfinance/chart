import { LibrarySymbolInfo } from '../charting_library/charting_library'
import { getPerpsTokenAddr, getPerpsUrl, isPerpsApp } from './constants'
import { getChainIdRelayer, getNextBarTime, parseResolution } from './helpers'
import { Resolution } from './types'

type Bar = {
  time: number
  open: number
  high: number
  low: number
  close: number
}
type Subscription = {
  onRealtimeCallback: (data: any) => void
  enabled: boolean
  lastBar?: Bar
  reader?: ReadableStreamDefaultReader
}

type SubscriptionUID = string
const subscriptions = new Map<SubscriptionUID, Subscription>()

async function subscribeToReader(subscribeUID: string, symbol: string, resolution: Resolution) {
  if (!isPerpsApp()) throw 'TODO: to implement'
  const subscriptionItem = subscriptions.get(subscribeUID)
  if (!subscriptionItem) {
    console.error('[subscribeToReader]: Unable to find subscription item')
    return
  } else if (subscriptionItem.reader) {
    console.log('[subscribeToReader]: Already subscribed to reader', subscribeUID)
    return
  }

  const [ticker, _, chainId, mode] = symbol.split(':') // ex: ETH:PERP:421614:LAST_PRICE

  let modeType 
  if (mode == 'LAST_PRICE') {
    modeType = 'lastPrice'
  } else if (mode == 'MARK_PRICE') {
    modeType = 'markPrice'
  } else {
    throw 'unsupported mode'
  }

  if (ticker != 'ETH' && ticker != 'BTC' && ticker != 'EVIV' && ticker != 'BVIV') {
    throw 'ticker unsupported'
  }
  const addr = getPerpsTokenAddr(Number(chainId), ticker)


  let response
  try {
    response = await fetch(`${getPerpsUrl()}/api/v1/perpetuals/streaming/markets/${getChainIdRelayer(Number(chainId))}/${addr}`)
    console.log(response)
  } catch (e) {
    console.error('error connecting to stream', e)
  }
  if (!response || !response.body) {
    console.error('Unable to get reader from server')
    return
  }
  const reader = response.body.getReader()
  subscriptionItem.reader = reader
  while (true) {
    let value
    let done
    try {
      const res = await reader.read()
      value = res.value
      done = res.done
    } catch (e) {
      console.error('error reading stream', e)
    }
    if (done) {
      await reader.cancel()
      subscriptionItem.enabled = false
      subscriptionItem.reader = undefined
      console.log('reader done')
      break
    }
    const rawTimeseries = new TextDecoder().decode(value).split('\n')
    console.log("streamingTimeseries", rawTimeseries)
    const parsedTimeseries = JSON.parse(rawTimeseries[0])
    const timeseries = {
      open: parsedTimeseries[modeType],
      high: parsedTimeseries[modeType],
      low: parsedTimeseries[modeType],
      close: parsedTimeseries[modeType],
      time: Date.now(),
    }
    const bar = timeseries
    subscriptionItem.lastBar = bar
    await subscriptionItem.onRealtimeCallback(bar)
  }
}

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: Resolution,
  onRealtimeCallback: (s: string) => void,
  subscribeUID: string,
  onResetCacheNeededCallback: (s: string) => void,
  lastDailyBar?: Bar
) {
  console.log('[subscribeOnStream1]', symbolInfo, resolution, subscribeUID, lastDailyBar, subscriptions)
  const asset = symbolInfo?.ticker

  const symbol = asset

  if (!symbol) {
    console.warn('Unsupported asset for streaming', asset)
    return
  }
  const subscriptionItem = subscriptions.get(subscribeUID)
  try {
    if (!subscriptionItem) {
      subscriptions.set(subscribeUID, {
        onRealtimeCallback,
        enabled: true,
        lastBar: lastDailyBar,
      })
      subscribeToReader(subscribeUID, symbol, resolution)
    } else if (!subscriptionItem.reader) {
      // already subscribed to reader
      subscriptionItem.onRealtimeCallback = onRealtimeCallback
      subscriptionItem.enabled = true
      subscribeToReader(subscribeUID, symbol, resolution)
    }
  } catch (e) {
    location.reload()
  }
}

export async function unsubscribeFromStream(subscriberUID: string) {
  console.log('[unsubscribeFromStream]', subscriberUID)
  const subscriptionItem = subscriptions.get(subscriberUID)
  if (!subscriptionItem) {
    console.warn('[unsubscribeFromStream]: Unable to find subscription item for subscriberUID', subscriberUID)
    return
  }
  await subscriptionItem.reader?.cancel()
  subscriptionItem.enabled = false
  subscriptionItem.reader = undefined
}
