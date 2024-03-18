import { getNextBarTime, parseResolution } from './helpers'
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
  firstTime: boolean
}

type SubscriptionUID = string
const subscriptions = new Map<SubscriptionUID, Subscription>()
// todo: reduce to one subscription per symbol (currently it does 2 for each symbol which is not needed)
async function subscribeToReader(subscribeUID: string, symbol: string, resolution: Resolution) {
  const subscriptionItem = subscriptions.get(subscribeUID)
  if (!subscriptionItem) {
    console.error('[subscribeToReader]: Unable to find subscription item')
    return
  } else if (!subscriptionItem.firstTime) {
    console.log('[subscribeToReader]: Already subscribed to reader', subscribeUID)
    return
  }
  // else if (subscriptionItem.reader) {
  //   console.error('[subscribeToReader]: Already subscribed to reader')
  //   return
  // } else if (!subscriptionItem.enabled) {
  //   console.error('[subscribeToReader]: Subscription is disabled')
  //   return
  // } else if (!subscriptionItem.firstTime) {
  //   return
  // }
  subscriptionItem.firstTime = false
  const url = new URL('https://rest-v1.volmex.finance/public/iv/streaming')

  const resolutionMap = {
    '1': '1',
    '5': '5',
    '15': '15',
    '60': '60',
    '1D': 'D',
  }
  url.searchParams.append('symbol', symbol)
  url.searchParams.append('resolution', resolutionMap[resolution])
  const ivProvider = window.location.search.split('iv_provider=')[1]
  if (ivProvider) {
    url.searchParams.append('iv_provider', ivProvider)
  }
  let response
  try {
    response = await fetch(url)
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
      console.log('reader done')
      break
    }
    const rawTimeseries = new TextDecoder().decode(value).split('\n')
    const parsedTimeseries = JSON.parse(rawTimeseries[0])
    const timeseries = {
      open: parsedTimeseries.o,
      high: parsedTimeseries.h,
      low: parsedTimeseries.l,
      close: parsedTimeseries.c,
      time: parsedTimeseries.t * 1000,
    }
    const { lastBar } = subscriptionItem
    const nextBarTime = getNextBarTime(resolution)
    const bar = timeseries
    subscriptionItem.lastBar = bar
    console.log({ bar, resolution, symbol, subscribeUID })
    await subscriptionItem.onRealtimeCallback(bar)
  }
}

export function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscribeUID,
  onResetCacheNeededCallback,
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
        firstTime: true,
      })
      subscribeToReader(subscribeUID, symbol, resolution)
    } else if (!subscriptionItem.reader) {
      // already subscribed to reader
      subscriptionItem.onRealtimeCallback = onRealtimeCallback
      subscriptionItem.enabled = true
      subscriptionItem.firstTime = true
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
  subscriptionItem.firstTime = false
  subscriptionItem.reader = undefined
}
