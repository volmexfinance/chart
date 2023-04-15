export const apiBaseUrl =
  typeof window !== `undefined` && window.location.hostname.includes('volmex.finance')
    ? 'https://rest-v1.volmex.finance'
    : 'https://test-api.volmex.finance'
