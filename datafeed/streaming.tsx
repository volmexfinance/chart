import { parseResolution } from './helpers'
import { gql } from '@apollo/client'
import { apolloClient } from '.'

const subscriptions: any = {}
const unsubscriptions: any = {}

export function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscribeUID,
  onResetCacheNeededCallback,
  lastDailyBar
) {
  const asset = symbolInfo?.ticker
  const timeBucket = parseResolution(resolution)
  console.log({ asset, subscribeUID })
  // get iv_provider from URL query params
  const ivProvider = window.location.search.split('iv_provider=')[1]

  subscriptions[subscribeUID] = {
    asset,
    subscribeUID,
    resolution,
    lastBar: lastDailyBar,
  }
  const url = new URL('https://rest-v1.volmex.finance/public/streaming')
  const symbol =
    {
      ETH: 'EVIV',
      BTC: 'BVIV',
    }[asset as string] ?? 'EVIV'
  url.searchParams.append('symbol', symbol)
  url.searchParams.append('resolution', 'D')
  console.log({ url })
  fetch('https://rest-v1.volmex.finance/public/streaming?symbol=EVIV&resolution=1').then(async (response) => {
    if (!response || !response.body) {
      console.error('No response from server')
      return
    }
    const reader = response.body.getReader()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      const rawTimeseries = new TextDecoder().decode(value)
      console.log('Received', rawTimeseries)
      console.log('Received', JSON.parse(rawTimeseries))
      console.log({ value })
    }
  })

  console.log('Response fully received')
  subscriptions[subscribeUID].client = apolloClient
    .subscribe({
      query: gql`
        subscription timeSeries($asset: String!, $timeBucket: String!, $provider: String!) {
          timeSeries(asset: $asset, timeBucket: $timeBucket, provider: $provider) {
            open
            high
            close
            low
            date
          }
        }
      `,
      variables: {
        asset,
        timeBucket,
        provider: ivProvider || 'global',
      },
    })
    .subscribe({
      next(response) {
        const _lastBar = updateBar(response.data.timeSeries, subscriptions[subscribeUID])
        // console.log('_lastBar', _lastBar)
        onRealtimeCallback(_lastBar)
        subscriptions[subscribeUID].lastBar = _lastBar
      },
      error(err) {
        console.error('err', err)
      },
    })
}

export function unsubscribeFromStream(subscriberUID) {
  unsubscriptions[subscriberUID] = true
}

function updateBar(data: any, sub: any) {
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
