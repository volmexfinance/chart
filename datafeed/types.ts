export type SymbolInfo = {
  name: string
  exchange: string
  full_name: string
  description: string
}
export type Resolution = '1' | '5' | '15' | '60' | '1D'

export type Bar = {
  time: number
  low: number
  high: number
  open: number
  close: number
  volume: number
}
