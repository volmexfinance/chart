import { isPerpsApp } from "./constants"

export function getAllSymbols() {
  // const indexAssets = getTokenList('index', 80001)
  const indexAssets = [
    { symbol: 'ETH', name: 'Ethereum', onlyRVandRP: false },
    { symbol: 'BTC', name: 'Bitcoin', onlyRVandRP: false },
    { symbol: 'BNB', name: 'Binance', onlyRVandRP: true },
    { symbol: 'XRP', name: 'XRP', onlyRVandRP: true },
    { symbol: 'ADA', name: 'Cardano', onlyRVandRP: true },
    { symbol: 'DOGE', name: 'Dogecoin', onlyRVandRP: true },
    { symbol: 'MATIC', name: 'Polygon', onlyRVandRP: true },
    { symbol: 'OKB', name: 'OKB', onlyRVandRP: true },
    { symbol: 'SOL', name: 'SOL', onlyRVandRP: true },
    { symbol: 'SHIB', name: 'Shiba Inu', onlyRVandRP: true },
    { symbol: 'DOT', name: 'Polkadot', onlyRVandRP: true },
    { symbol: 'LTC', name: 'Litecoin', onlyRVandRP: true },
    { symbol: 'TRX', name: 'Tron', onlyRVandRP: true },
    { symbol: 'AVAX', name: 'Avalanche', onlyRVandRP: true },
    { symbol: 'UNI', name: 'Uniswap', onlyRVandRP: true },
    { symbol: 'ATOM', name: 'Cosmos', onlyRVandRP: true },
    { symbol: 'TON', name: 'Toncoin', onlyRVandRP: true },
    { symbol: 'LINK', name: 'Chainlink', onlyRVandRP: true },
    { symbol: 'LEO', name: 'LEO', onlyRVandRP: true },
    { symbol: 'XMR', name: 'Monero', onlyRVandRP: true },
    { symbol: 'ETC', name: 'Ethereum Classic', onlyRVandRP: true },
    { symbol: 'BCH', name: 'Bitcoin Cash', onlyRVandRP: true },
    { symbol: 'APT', name: 'Aptos', onlyRVandRP: true },
    { symbol: 'XLM', name: 'Stellar', onlyRVandRP: true },
    { symbol: 'LDO', name: 'Lido', onlyRVandRP: true },
  ]
  const symbolList = [
    'BTC',
    'ETH',
    'BNB',
    'XRP',
    'ADA',
    'DOGE',
    'MATIC',
    'OKB',
    'SOL',
    'SHIB',
    'DOT',
    'LTC',
    'TRX',
    'AVAX',
    'UNI',
    'ATOM',
    'TON',
    'LINK',
    'LEO',
    'XMR',
    'ETC',
    'BCH',
    'APT',
    'XLM',
    'LDO',
  ]

  const getVolmexSymbolIV = (baseSymbol: string, name: string) => {
    return {
      symbol: baseSymbol + 'VIV',
      full_name: baseSymbol + 'VIV',
      description: `${name} Implied Volatility Index`,
      exchange: 'Volmex',
      type: 'crypto',
    }
  }

  const getVolmexSymbolRP = (baseSymbol: string, name: string) => {
    return {
      symbol: baseSymbol + 'VRP',
      full_name: baseSymbol + 'VRP',
      description: `${name} Realized Price Index`,
      exchange: 'Volmex',
      type: 'crypto',
    }
  }

  const getVolmexSymbolsRV = (baseSymbol: string, name: string) => {
    //rv_01,rv_03,rv_07,rv_14,rv_30,rv_60,rv_90.
    const times = ['1D', '3D', '1W', '2W', '1M', '2M', '3M']
    const timeName = ['1 Day', '3 Day', '1 Week', '2 Week', '1 Month', '2 Month', '3 Month']

    // times and timeName into json
    const rvList = times.map((time, index) => {
      return {
        symbol: baseSymbol + 'VRV' + time,
        full_name: baseSymbol + 'VRV' + time,
        description: `${name} Realized Volatility ${timeName[index]} Index`,
        exchange: 'Volmex',
        type: 'crypto',
      }
    })
    return rvList
  }

  const getVolmexSymbolsVCORR = (baseSymbol: string, name: string) => {
    return [
      {
        symbol: baseSymbol + 'VCORR3D',
        full_name: baseSymbol + 'VCORR3D',
        description: `${name} Spot Volatility 3 Day Correlation Index`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VCORR1W',
        full_name: baseSymbol + 'VCORR1W',
        description: `${name} Spot Volatility 1 Week Correlation Index`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VCORR2W',
        full_name: baseSymbol + 'VCORR2W',
        description: `${name} Spot Volatility 2 Week Correlation Index`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VCORR1M',
        full_name: baseSymbol + 'VCORR1M',
        description: `${name} Spot Volatility 1 Month Correlation Index`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VCORR2M',
        full_name: baseSymbol + 'VCORR2M',
        description: `${name} Spot Volatility 2 Month Correlation Index`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VCORR3M',
        full_name: baseSymbol + 'VCORR3M',
        description: `${name} Spot Volatility 3 Month Correlation Index`,
        exchange: 'Volmex',
        type: 'crypto',
      },
    ]
  }
  const getVolmexSymbolsFromIndex = (index: { symbol: string; name: string }, onlyRVandRP: boolean) => {
    const baseSymbol = index.symbol === 'ETH' ? 'E' : index.symbol === 'BTC' ? 'B' : index.symbol
    const volmexSymbolIV = getVolmexSymbolIV(baseSymbol, index.name)
    const volmexSymbolsRV = getVolmexSymbolsRV(baseSymbol, index.name)
    // const volmexSymbolRP = getVolmexSymbolRP(baseSymbol, index.name)
    const volmexSymbolsVCORR = getVolmexSymbolsVCORR(baseSymbol, index.name)

    const volmexSymbolsPerps: any[] = [] /*indexAssets.map((index) => ({
        symbol: index.symbol,
        full_name: index.symbol + ' Mark',
        description: `${index.name} Volatility Index`,
        exchange: 'VolmexPerps',
        type: 'crypto',
      }))*/

    if (onlyRVandRP) {
      return [...volmexSymbolsRV] //[...volmexSymbolsRV, volmexSymbolRP]
    } else {
      return [volmexSymbolIV, ...volmexSymbolsRV, ...volmexSymbolsVCORR] //[volmexSymbolIV, ...volmexSymbolsRV, volmexSymbolRP, ...volmexSymbolsVCORR] //,...volmexSymbolsPerps]
    }
  }

  const volmexSymbols = indexAssets.reduce<
    Array<{
      symbol: string
      full_name: string
      description: string
      exchange: string
      type: string
    }>
  >((acc, index) => {
    const volmexSymbols = getVolmexSymbolsFromIndex(index, index.onlyRVandRP)
    acc.push(...volmexSymbols)
    return acc
  }, [])

  const generateIndexPriceSymbols = () => {
    return indexAssets.filter(i => i.symbol == 'ETH' || i.symbol == 'BTC').map((i) => {
      return {
        symbol: i.symbol + '/USD',
        full_name: i.symbol + '/USD',
        description: `${i.name} USD price`,
        exchange: 'Coinbase',
        type: 'crypto',
      }
    })
  }
  
    // assuming if REACT_APP_ENABLED_CHAIN_IDS is set, then we want to show perps symbols
    const volmexSymbolsPerps: any[] = []
    if (isPerpsApp() && process.env.REACT_APP_ENABLED_CHAIN_IDS != undefined) {
      volmexSymbolsPerps.push(
        ...[{ symbol: 'EVIV:PERP' }, { symbol: 'BVIV:PERP' }, { symbol: 'ETH:PERP' }, { symbol: 'BTC:PERP' }].flatMap(
          (index) =>
            (process.env.REACT_APP_ENABLED_CHAIN_IDS as string).split(',').flatMap((chainId) => [
              {
                symbol: index.symbol + ':' + chainId + ':LAST_PRICE',
                full_name: index.symbol + ':' + chainId + ':LAST_PRICE',
                description: `${index.symbol} Perpetuals ${chainId} Last Price`,
                exchange: 'VolmexPerps',
                type: 'crypto',
              },
              {
                symbol: index.symbol + ':' + chainId + ':MARK_PRICE',
                full_name: index.symbol + ':' + chainId + ':MARK_PRICE',
                description: `${index.symbol} Perpetuals ${chainId} Mark Price`,
                exchange: 'VolmexPerps',
                type: 'crypto',
              },
            ])
        )
      )
    }
  
  const extraSymbols = generateIndexPriceSymbols()
  return volmexSymbols.concat(extraSymbols).concat(volmexSymbolsPerps)
}
