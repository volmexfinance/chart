import { parseResolution } from './helpers'
import { gql } from '@apollo/client'
import { apolloClient } from '.'

const subscriptions: any = []

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

  // get iv_provider from URL query params
  const ivProvider = window.location.search.split('iv_provider=')[1]

  subscriptions[subscribeUID] = {
    asset,
    subscribeUID,
    resolution,
    lastBar: lastDailyBar,
  }

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
  subscriptions[subscriberUID].client.unsubscribe()
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
