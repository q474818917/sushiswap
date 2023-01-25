import { ChainId } from '@sushiswap/chain'

import { GRAPH_HOST_ENDPOINT } from '../../config.js'

export const GRAPH_HOST: Record<number | string, string> = {
  [ChainId.POLYGON]: GRAPH_HOST_ENDPOINT,
}
export const JETSWAP_V2_SUPPORTED_CHAINS = [ChainId.POLYGON]
export const JETSWAP_V2_SUBGRAPH_NAME: Record<number | string, string> = {
  [ChainId.POLYGON]: 'smartcookie0501/jetswap-subgraph-polygon-v2',
}
