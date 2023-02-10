import { parseResolution } from './helpers'
import { gql } from '@apollo/client'
import { apolloClient } from '../../../utils/apollo'

const subscriptions: any = {}

export function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscribeUID,
  onResetCacheNeededCallback,
  lastDailyBar
) {
  const asset = symbolInfo?.ticker

  const symbol = {
    ETH: 'EVIV',
    BTC: 'BVIV',
  }[asset as string]

  if (!symbol) {
    return
  }
  const timeBucket = parseResolution(resolution)
  console.log({ asset, subscribeUID })
  // get iv_provider from URL query params
  const ivProvider = window.location.search.split('iv_provider=')[1]
  console.log({ subscriptions })
  subscriptions[subscribeUID] = {
    asset,
    subscribeUID,
    resolution,
    lastBar: lastDailyBar,
    enabled: true,
  }
  const url = new URL('https://rest-v1.volmex.finance/public/streaming')

  const resolutionMap = {
    '1': '1',
    '5': '5',
    '15': '15',
    '60': '60',
    '1D': 'D',
  }
  url.searchParams.append('symbol', symbol)
  url.searchParams.append('resolution', resolutionMap[resolution] || '1')

  fetch(url).then(async (response) => {
    if (!response || !response.body) {
      console.error('No response from server')
      return
    }
    const reader = response.body.getReader()
    while (subscriptions[subscribeUID].enabled) {
      try {
        const { value, done } = await reader.read()
        if (done || subscriptions[subscribeUID].enabled === false) {
          reader.releaseLock() // not sure if this is needed
          break
        }
        const rawTimeseries = new TextDecoder().decode(value).split('\n')[0]
        const parsedTimeseries = JSON.parse(rawTimeseries)

        const timeseries = {
          open: parsedTimeseries.o,
          high: parsedTimeseries.h,
          low: parsedTimeseries.l,
          close: parsedTimeseries.c,
          date: parsedTimeseries.t * 1000,
        }
        const _lastBar = updateBar(timeseries)

        onRealtimeCallback(_lastBar)
        subscriptions[subscribeUID].lastBar = _lastBar
      } catch (e) {
        console.error('error', e)
      }
    }
  })
}

export function unsubscribeFromStream(subscriberUID) {
  subscriptions[subscriberUID].enabled = false
}

function updateBar(data: any) {
  const { open, high, low, close, date } = data
  const time = new Date(date).getTime()

  return {
    time,
    open,
    high,
    low,
    close,
  }
}
