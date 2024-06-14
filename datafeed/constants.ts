import { restUrl } from "../../tvchart.constants";

export const apiBaseUrl =
  typeof window !== `undefined` && window.location.hostname.includes('volmex.finance')
    ? restUrl
    : 'https://test-api.volmex.finance'
