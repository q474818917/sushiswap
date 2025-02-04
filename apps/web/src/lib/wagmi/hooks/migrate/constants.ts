import { ChainId } from 'sushi/chain'
import type { V3MigrateChainId } from './types'

export const V3MigrateAddress = {
  [ChainId.ARBITRUM_NOVA]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.ARBITRUM]: '0x700A39Cc1Ae464d279ec9217Ab3bf107e90AC91C',
  [ChainId.AVALANCHE]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.BOBA]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.BSC]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.ETHEREUM]: '0xc4817DEC4e969F7Ea0c8b5bF9913697869A98e47',
  [ChainId.FANTOM]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.FUSE]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.GNOSIS]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.MOONBEAM]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.MOONRIVER]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.OPTIMISM]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.POLYGON]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.POLYGON_ZKEVM]: '0xFB7eF66a7e61224DD6FcD0D7d9C3be5C8B049b9f',
  [ChainId.THUNDERCORE]: '0x1be211D8DA40BC0ae8719c6663307Bfc987b1d6c',
}

export const V3MigrateChainIds = Object.keys(V3MigrateAddress).map(
  (el) => +el as V3MigrateChainId,
) as V3MigrateChainId[]
