export const VOLMEX_API_CONSTANTS = {
  resolutionToInterval: {
    '1': '1',
    '5': '5',
    '15': '15',
    '60': '60',
    '240': '60',
    '1D': 'D',
    // ''
  },
  calculateBack3Days: (to: number) => {
    const back3Days = 3 * 24 * 60 * 60
    return to - back3Days
  },
  calculateBack40Days: (to: number) => {
    const back40Days = 40 * 24 * 60 * 60
    return to - back40Days
  },
  calculateBack1000Days: (to: number) => {
    const back1000Days = 1000 * 24 * 60 * 60
    return to - back1000Days
  },
}
