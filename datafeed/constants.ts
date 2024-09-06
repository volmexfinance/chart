import { RestApiEnvironment } from "./types"

const apiBaseUrl =
  typeof window !== `undefined` && window.location.hostname.includes('volmex.finance') || window.location.hostname.includes('monitoring')
    ? 'https://rest-v1.volmex.finance'
    : 'https://test-api.volmex.finance'


export const getApiBaseUrlWithRestApiEnvironment = (env?: RestApiEnvironment) => {
  switch (env) {
    case "green":
      return 'https://rest-v1-green.volmex.finance'
    case "blue":
      return 'https://rest-v1-blue.volmex.finance'
    default:
      return apiBaseUrl
  }
}