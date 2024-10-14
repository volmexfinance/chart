import { RestApiEnvironment } from "./types"

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
    { symbol: 'SOL', name: 'Solana', features: [] },
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
    'SOL',
    'BNB',
    'XRP',
    'ADA',
    'DOGE',
    'MATIC',
    'OKB',
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
    const times = ['1D', '3D', '7D', '14D', '30D', '60D', '90D']
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
  /*
Also the naming convention it’s:  EVBR1W - Ethereum Volmex Basis Rate Index (1 Week)
Here are all the types of parameters to send to the history endpoint:
dte0007: Annualized implied rate of basis at 7-day maturity. Floating number
dte0014: Annualized implied rate of basis at 14-day maturity. Floating number
dte0030: Annualized implied rate of basis at 30-day maturity. Floating number
dte0060: Annualized implied rate of basis at 60-day maturity. Floating number
dte0090: Annualized implied rate of basis at 90-day maturity. Floating number
dte0120: Annualized implied rate of basis at 120-day maturity. Floating number
dte0180: Annualized implied rate of basis at 180-day maturity. Floating number
dte0270: Annualized implied rate of basis at 270-day maturity. Floating number
dte0360: Annualized implied rate of basis at 360-day maturity. Floating number
*/
  const getVolmexSymbolsVBR = (baseSymbol: string, name: string) => {
    return [
      {
        symbol: baseSymbol + 'VBR1W',
        full_name: baseSymbol + 'VBR1W',
        description: `${name} Volmex Basis Rate Index (1 Week)`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VBR2W',
        full_name: baseSymbol + 'VBR2W',
        description: `${name} Volmex Basis Rate Index (2 Week)`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VBR1M',
        full_name: baseSymbol + 'VBR1M',
        description: `${name} Volmex Basis Rate Index (1 Month)`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VBR2M',
        full_name: baseSymbol + 'VBR2M',
        description: `${name} Volmex Basis Rate Index (2 Month)`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VBR3M',
        full_name: baseSymbol + 'VBR3M',
        description: `${name} Volmex Basis Rate Index (3 Month)`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VBR4M',
        full_name: baseSymbol + 'VBR4M',
        description: `${name} Volmex Basis Rate Index (4 Month)`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VBR6M',
        full_name: baseSymbol + 'VBR6M',
        description: `${name} Volmex Basis Rate Index (6 Month)`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VBR9M',
        full_name: baseSymbol + 'VBR9M',
        description: `${name} Volmex Basis Rate Index (9 Month)`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: baseSymbol + 'VBR1Y',
        full_name: baseSymbol + 'VBR1Y',
        description: `${name} Volmex Basis Rate Index (1 Year)`,
        exchange: 'Volmex',
        type: 'crypto',
      },
    ]
  }
  const getVolmexSymbolsFromIndex = (index: { symbol: string; name: string }, features: Array<string>) => {
    const baseSymbol = index.symbol === 'ETH' ? 'E' : index.symbol === 'BTC' ? 'B' : index.symbol === 'SOL' ? 'S' : index.symbol
    const volmexSymbolIV = getVolmexSymbolIV(baseSymbol, index.name)
    const volmexSymbolsRV = getVolmexSymbolsRV(baseSymbol, index.name)
    const volmexSymbolRP = getVolmexSymbolRP(baseSymbol, index.name)
    // const volmexSymbolRP = getVolmexSymbolRP(baseSymbol, index.name)
    let volmexSymbolsVCORR = []
    if (index.symbol === 'ETH' || index.symbol === 'BTC') {
      volmexSymbolsVCORR = getVolmexSymbolsVCORR(baseSymbol, index.name)
    }

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
      .filter((i) => i.symbol == 'ETH' || i.symbol == 'BTC'  || i.symbol == 'SOL')
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

  const generateDVIVSymbol = () => {
    return {
      symbol: 'DVIV',
      full_name: 'DVIV',
      description: `Market Volmex Implied Volatility Index`,
      exchange: 'Volmex',
      type: 'crypto',
    }
  }

  const generateBullBearSymbols = () => {
    return [
      {
        symbol: 'BVBEAR',
        full_name: 'BVBear',
        description: `Bitcoin Volmex Bear (30-day) Implied Semi-volatility Index`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: 'BVBULL',
        full_name: 'BVBull',
        description: `Bitcoin Volmex Bull (30-day) Implied Semi-volatility Index`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: 'EVBEAR',
        full_name: 'EVBear',
        description: `Ethereum Volmex Bear (30-day) Implied Semi-volatility Index`,
        exchange: 'Volmex',
        type: 'crypto',
      },
      {
        symbol: 'EVBULL',
        full_name: 'EVBull',
        description: `Ethereum Volmex Bull (30-day) Implied Semi-volatility Index`,
        exchange: 'Volmex',
        type: 'crypto',
      }
    ]
  }
  
  const generateSVIVSymbol = () => {
    return {
      symbol: 'SVIV14D',
      full_name: 'SVIV14D',
      description: `Solana Volmex Implied Volatility Index (14-day)`,
      exchange: 'Volmex',
      type: 'crypto',
    }
  }

  const generateVBRSymbols = () => {
    return [...getVolmexSymbolsVBR('E', 'Ethereum'), ...getVolmexSymbolsVBR('B', 'Bitcoin')]
  }

  const generateVAICCSymbols = () => {
    return [
      {
        symbol: 'VAIC',
        full_name: 'VAIC',
        description: `Volmex AI Cloud Index`,
        exchange: 'Volmex',
        type: 'ai',
      },
      {
        symbol: 'VAIH',
        full_name: 'VAIH',
        description: `Volmex AI Hardware Index`,
        exchange: 'Volmex',
        type: 'ai',
      },
      {
        symbol: 'VAI',
        full_name: 'VAI',
        description: `Volmex AI Index`,
        exchange: 'Volmex',
        type: 'ai',
      }
    ]
  }


  const generateAllSymbolsPerEnv = (env?: RestApiEnvironment) => {
    const allVolmexSymbols = volmexSymbols
    .concat(extraSymbols)
    // .concat(generateTVIVSymbol())
    .concat(generateMVIVSymbol())
    .concat(generateVBRSymbols())
  // .concat(generateDVIVSymbol())
    .concat(generateBullBearSymbols())
    // .concat(generateDVIVSymbol())
    .concat(generateSVIVSymbol())
    .concat(generateVAICCSymbols())

    if (env) {
      return allVolmexSymbols.map((s) => ({...s, symbol: s.symbol + '-' + env, full_name: s.full_name + '-' + env,  }))
    } else {
      return allVolmexSymbols
    }
  }

  // disable blue and green in volmex.finance domain
  if (window.location.hostname.includes('volmex.finance')) {
    return generateAllSymbolsPerEnv()
  }
  return generateAllSymbolsPerEnv()
    .concat(generateAllSymbolsPerEnv('blue'))
    .concat(generateAllSymbolsPerEnv('green'))
}
