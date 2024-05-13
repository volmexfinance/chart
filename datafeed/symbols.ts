export function getAllSymbols() {
  // const indexAssets = getTokenList('index', 80001)
  const indexAssets = [
    { symbol: 'ETH', name: 'Ethereum', features: ['VRP'] },
    { symbol: 'BTC', name: 'Bitcoin', features: ['VRP'] },
    { symbol: 'BNB', name: 'Binance', features: [] },
    { symbol: 'XRP', name: 'XRP', features: [] },
    { symbol: 'ADA', name: 'Cardano', features: [] },
    { symbol: 'DOGE', name: 'Dogecoin', features: [] },
    { symbol: 'MATIC', name: 'Polygon', features: [] },
    { symbol: 'OKB', name: 'OKB', features: [] },
    { symbol: 'SOL', name: 'SOL', features: [] },
    { symbol: 'SHIB', name: 'Shiba Inu', features: [] },
    { symbol: 'DOT', name: 'Polkadot', features: [] },
    { symbol: 'LTC', name: 'Litecoin', features: [] },
    { symbol: 'TRX', name: 'Tron', features: [] },
    { symbol: 'AVAX', name: 'Avalanche', features: [] },
    { symbol: 'UNI', name: 'Uniswap', features: [] },
    { symbol: 'ATOM', name: 'Cosmos', features: [] },
    { symbol: 'TON', name: 'Toncoin', features: [] },
    { symbol: 'LINK', name: 'Chainlink', features: [] },
    { symbol: 'LEO', name: 'LEO', features: [] },
    { symbol: 'XMR', name: 'Monero', features: [] },
    { symbol: 'ETC', name: 'Ethereum Classic', features: [] },
    { symbol: 'BCH', name: 'Bitcoin Cash', features: [] },
    { symbol: 'APT', name: 'Aptos', features: [] },
    { symbol: 'XLM', name: 'Stellar', features: [] },
    { symbol: 'LDO', name: 'Lido', features: [] },
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
  const getVolmexSymbolsFromIndex = (index: { symbol: string; name: string }, features: Array<string>) => {
    const baseSymbol = index.symbol === 'ETH' ? 'E' : index.symbol === 'BTC' ? 'B' : index.symbol
    const volmexSymbolIV = getVolmexSymbolIV(baseSymbol, index.name)
    const volmexSymbolsRV = getVolmexSymbolsRV(baseSymbol, index.name)
    const volmexSymbolRP = getVolmexSymbolRP(baseSymbol, index.name)
    const volmexSymbolsVCORR = getVolmexSymbolsVCORR(baseSymbol, index.name)

    const volmexSymbolsPerps: any[] = [] /*indexAssets.map((index) => ({
        symbol: index.symbol,
        full_name: index.symbol + ' Mark',
        description: `${index.name} Volatility Index`,
        exchange: 'VolmexPerps',
        type: 'crypto',
      }))*/
    const symbols = [volmexSymbolIV, ...volmexSymbolsRV, ...volmexSymbolsVCORR]

    if (features.includes('VRP')) {
      symbols.push(volmexSymbolRP)
    }
    return symbols
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
    const volmexSymbols = getVolmexSymbolsFromIndex(index, index.features)
    acc.push(...volmexSymbols)
    return acc
  }, [])

  const generateIndexPriceSymbols = () => {
    // Only show ETH and BTC index price
    return indexAssets
      .filter((i) => i.symbol == 'ETH' || i.symbol == 'BTC')
      .map((i) => {
        return {
          symbol: i.symbol + '/USD',
          full_name: i.symbol + '/USD',
          description: `${i.name} USD price`,
          exchange: 'Coinbase',
          type: 'crypto',
        }
      })
  }
  console.log({ volmexSymbols })
  const extraSymbols = generateIndexPriceSymbols()
  const generateTVIVSymbol = () => {
    return {
      symbol: 'TVIV',
      full_name: 'TVIV',
      description: `Total Volmex Implied Volatility Index`,
      exchange: 'Volmex',
      type: 'crypto',
    }
  }

  const generateMVIVSymbol = () => {
    return {
      symbol: 'MVIV',
      full_name: 'MVIV',
      description: `Market Volmex Implied Volatility Index`,
      exchange: 'Volmex',
      type: 'crypto',
    }
  }

  return volmexSymbols.concat(extraSymbols).concat(generateTVIVSymbol()).concat(generateMVIVSymbol())
}
