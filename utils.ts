type AssetType = 'index' | 'token'
type DepositAssets = 'USDC' | 'DAI'
type IndexAssets = 'ETH' | 'BTC'

type TokenType = {
  chainId: number
  address: string
  name: string
  symbol: DepositAssets
  decimals: number
  logoURI: string
}

type IndexType = {
  symbol: IndexAssets
  volatilityToken: string
  inverseVolatilityToken: string
  chainId: number
  name: string
  logoURI: string
}

const supportedDepositTokens = [
  {
    name: 'Dai Stablecoin',
    address: '0x0A7acbEAc76224C79A401d222B28E42d9d38e4Fd',
    symbol: 'DAI',
    decimals: 18,
    chainId: 42,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  {
    name: 'Dai Stablecoin',
    address: '0xd214d87cb51ce5a434426e6066e666ca1394dc88',
    symbol: 'DAI',
    decimals: 18,
    chainId: 5,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  {
    name: 'Dai Stablecoin',
    address: '0xeabf1b4f19439af69302d6701a00e3c34d0ad20b',
    symbol: 'DAI',
    decimals: 18,
    chainId: 80001,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  {
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    decimals: 18,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  {
    name: 'Dai Stablecoin',
    address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    symbol: 'DAI',
    decimals: 18,
    chainId: 137,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  {
    name: 'Dai Stablecoin',
    address: '0xEabf1B4F19439AF69302d6701a00E3c34D0AD20b',
    symbol: 'DAI',
    decimals: 18,
    chainId: 421611,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  {
    name: 'USD Coin',
    address: '0xa892e4D27C13f00d4AaEb649AEa03Bfe65d2D8dc',
    symbol: 'USDC',
    decimals: 6,
    chainId: 42,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    name: 'USD Coin',
    address: '0xaFD38467Ef8b9048Ddb853221dE79f993a103f21',
    symbol: 'USDC',
    decimals: 6,
    chainId: 80001,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    name: 'USD Coin',
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC',
    decimals: 6,
    chainId: 137,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
]

const supportedIndexes = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    volatilityToken: '0x853c61fb51Af5d75233465F6C1D625a78d83566b',
    inverseVolatilityToken: '0x30Aec63F547108e54641c3aAbC96735cD8e51FB5',
    chainId: 42,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    volatilityToken: '0x5B36Ae787ccB1834fe09917E18E9379747eBC01D',
    inverseVolatilityToken: '0x01374Cb373e7Aacfc310D3f1FFBb49424986D4A4',
    chainId: 42,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master//blockchains/bitcoin/info/logo.png',
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    volatilityToken: '0xC53342fd7575f572b0fF4569e31941A5B821aC76',
    inverseVolatilityToken: '0x3A707d56D538e85B783E8CE12B346e7fB6511F90',
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    volatilityToken: '0x51B0bcBEFf204B39Ce792D1E16767Fe6F7631970',
    inverseVolatilityToken: '0x2590F1fD14Ef8Bb0A46C7A889c4CBc146510f9C3',
    chainId: 1,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master//blockchains/bitcoin/info/logo.png',
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    volatilityToken: '0x2Bd58BB3267ab94643dCaEfee07b1F907F0E39a4',
    inverseVolatilityToken: '0x80F2f373A016D489C0442Bde7D9d862989AaA93B',
    chainId: 5,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    volatilityToken: '0x886c270E30a3255167754e1B49Ca56ebC1F32655',
    inverseVolatilityToken: '0xc3C13d9e01d2ffb632F95a77210849bc5E2Bcd69',
    chainId: 5,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master//blockchains/bitcoin/info/logo.png',
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    volatilityToken: '0xd214d87Cb51ce5a434426e6066E666cA1394dc88',
    inverseVolatilityToken: '0x429E89202a75652dd96c7E80AfB904eBF5403a17',
    chainId: 80001,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    volatilityToken: '0xE94ee63927bee73Cf4e62adA3E06b4C84431C912',
    inverseVolatilityToken: '0xcd3Ed7BFf2678e018d637451B449A76ed9584398',
    chainId: 80001,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master//blockchains/bitcoin/info/logo.png',
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    volatilityToken: '0x3Dbd2A88627566306AE9f5F5FB466B498535aF21',
    inverseVolatilityToken: '0x39cDBd331c94d781D4B50802346152549689B1e5',
    chainId: 137,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    volatilityToken: '0xE52F979590067637120004D188771b4aE48807Ee',
    inverseVolatilityToken: '0x89b1F5DB1797f82af33dED6e6B50623a83aE84fA',
    chainId: 137,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master//blockchains/bitcoin/info/logo.png',
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    volatilityToken: '0xCb3f5b214636097281CB1262FC8f83409d1e71d1',
    inverseVolatilityToken: '0x959812B319Ed43154beFD672E469Fccf38c5D8C9',
    chainId: 421611,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
]

export function getTokenList(assetType: AssetType, chainId?: number): Array<TokenType | IndexType> {
  let tokenList: Array<TokenType | IndexType>

  switch (assetType) {
    case 'token':
      tokenList = supportedDepositTokens
      break
    case 'index':
      tokenList = supportedIndexes
      break
    default:
      tokenList = []
  }

  return tokenList.filter((token) => token.chainId == chainId)
}
