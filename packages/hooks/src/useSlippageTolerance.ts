'use client'

import { DEFAULT_SLIPPAGE } from 'sushi/config'
import { useLocalStorage } from './useLocalStorage'

export enum SlippageToleranceStorageKey {
  Swap = 'slippage-swap',
  AddLiquidity = 'slippage-add-liquidity',
  RemoveLiquidity = 'slippage-remove-liquidity',
  AddSteerLiquidity = 'slippage-add-steer-liquidity',
  RemoveSteerLiquidity = 'slippage-remove-steer-liquidity',
}

export const useSlippageTolerance = (
  key: SlippageToleranceStorageKey = SlippageToleranceStorageKey.Swap,
  defaultValue?: string,
) => useLocalStorage(key, defaultValue || DEFAULT_SLIPPAGE)
