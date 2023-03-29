// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
// import { erc20Abi, weth9Abi } from '@sushiswap/abi'
// import { bentoBoxV1Address, BentoBoxV1ChainId } from '@sushiswap/bentobox'
// import { ChainId, chainName } from '@sushiswap/chain'
// import {
//   DAI,
//   DAI_ADDRESS,
//   FRAX,
//   FRAX_ADDRESS,
//   FXS,
//   FXS_ADDRESS,
//   Native,
//   SUSHI,
//   SUSHI_ADDRESS,
//   Token,
//   Type,
//   USDC,
//   USDC_ADDRESS,
//   USDT,
//   USDT_ADDRESS,
//   WNATIVE,
// } from '@sushiswap/currency'
// import {
//   getCurrencyCombinations,
//   LiquidityProviders,
//   PoolFilter,
//   Router,
// } from '@sushiswap/router'
// import { PoolCode } from '@sushiswap/router/dist/pools/PoolCode'
// import { BridgeBento, getBigNumber, RPool, StableSwapRPool } from '@sushiswap/tines'
// import { expect } from 'chai'
// import { BigNumber, Contract } from 'ethers'
// import { ethers, network } from 'hardhat'
// import seedrandom from 'seedrandom'

// import { TestDataFetcher } from './TestDataFetcher'

// function getRandomExp(rnd: () => number, min: number, max: number) {
//   const minL = Math.log(min)
//   const maxL = Math.log(max)
//   const v = rnd() * (maxL - minL) + minL
//   const res = Math.exp(v)
//   console.assert(res <= max && res >= min, 'Random value is out of the range')
//   return res
// }

// interface TestEnvironment {
//   chainId: ChainId
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   provider: any
//   rp: Contract
//   user: SignerWithAddress
//   user2: SignerWithAddress
// }

// async function getTestEnvironment(): Promise<TestEnvironment> {
//   //console.log('Prepare Environment:')

//   //console.log('    Create DataFetcher ...')
//   const provider = ethers.provider
//   const chainId = network.config.chainId as ChainId

//   const RouteProcessor = await ethers.getContractFactory('RouteProcessor2')
//   const routeProcessor = await RouteProcessor.deploy(bentoBoxV1Address[chainId as BentoBoxV1ChainId])
//   await routeProcessor.deployed()
//   //console.log('    Block Number:', provider.blockNumber)

//   console.log(`Network: ${chainName[chainId]}, Forked Block: ${provider.blockNumber}`)
//   //console.log('    User creation ...')
//   const [Alice, Bob] = await ethers.getSigners()

//   return {
//     chainId,
//     provider,
//     rp: routeProcessor,
//     user: Alice,
//     user2: Bob,
//   }
// }

// // all pool data assumed to be updated
// async function makeSwap(
//   env: TestEnvironment,
//   fromToken: Type,
//   amountIn: BigNumber,
//   toToken: Type,
//   poolCodeMap: Map<string, PoolCode>,
//   providers?: LiquidityProviders[],
//   poolFilter?: PoolFilter,
//   makeSankeyDiagram = false
// ): Promise<[BigNumber, number] | undefined> {
//   //console.log(`Make swap ${fromToken.symbol} -> ${toToken.symbol} amount: ${amountIn.toString()}`)

//   if (fromToken instanceof Token) {
//     //console.log(`Approve user's ${fromToken.symbol} to the route processor ...`)
//     const WrappedBaseTokenContract = await new ethers.Contract(fromToken.address, erc20Abi, env.user)
//     await WrappedBaseTokenContract.connect(env.user).approve(env.rp.address, amountIn)
//   }


//   const route = Router.findBestRoute(poolCodeMap, env.chainId, fromToken, amountIn, toToken, 30e9,
//     providers ?? [LiquidityProviders.SushiSwap, LiquidityProviders.NativeWrap])

//   // console.log({route})
//   const rpParams = Router.routeProcessor2Params(
//     poolCodeMap,
//     route,
//     fromToken,
//     toToken,
//     env.user.address,
//     env.rp.address
//   )
//   if (rpParams === undefined) return

//   //console.log('Call route processor (may take long time for the first launch)...')
//   // const route = router.getBestRoute() as MultiRoute
//   let balanceOutBNBefore: BigNumber
//   let toTokenContract: Contract | undefined = undefined
//   if (toToken instanceof Token) {
//     toTokenContract = await new ethers.Contract(toToken.address, weth9Abi, env.user)
//     balanceOutBNBefore = await toTokenContract.connect(env.user).balanceOf(env.user.address)
//   } else {
//     balanceOutBNBefore = await env.user.getBalance()
//   }
//   let tx
//   if (rpParams.value)
//     tx = await env.rp.processRoute(
//       rpParams.tokenIn,
//       rpParams.amountIn,
//       rpParams.tokenOut,
//       rpParams.amountOutMin,
//       rpParams.to,
//       rpParams.routeCode,
//       { value: rpParams.value }
//     )
//   else
//     tx = await env.rp.processRoute(
//       rpParams.tokenIn,
//       rpParams.amountIn,
//       rpParams.tokenOut,
//       rpParams.amountOutMin,
//       rpParams.to,
//       rpParams.routeCode
//     )
//   const receipt = await tx.wait()

//   // const trace = await network.provider.send('debug_traceTransaction', [receipt.transactionHash])
//   // printGasUsage(trace)

//   //console.log("Fetching user's output balance ...")
//   let balanceOutBN: BigNumber
//   if (toTokenContract) {
//     balanceOutBN = (await toTokenContract.connect(env.user).balanceOf(env.user.address)).sub(balanceOutBNBefore)
//   } else {
//     balanceOutBN = (await env.user.getBalance()).sub(balanceOutBNBefore)
//     balanceOutBN = balanceOutBN.add(receipt.effectiveGasPrice.mul(receipt.gasUsed))
//   }
//   const slippage = parseInt(balanceOutBN.sub(route.amountOutBN).mul(10_000).div(route.amountOutBN).toString())

//   if (slippage < 0) {
//     console.log(`expected amountOut: ${route.amountOutBN.toString()}`)
//     console.log(`real amountOut:     ${balanceOutBN.toString()}`)
//     console.log(`slippage: ${slippage / 100}%`)
//   }
//   console.log(`gas use: ${receipt.gasUsed.toString()}`)
//   expect(slippage).greaterThanOrEqual(0) // positive slippage could be if we 'gather' some liquidity on the route

//   return [balanceOutBN, receipt.blockNumber]
// }

// // async function dataUpdated(env: TestEnvironment, minBlockNumber: number) {
// //   for (;;) {
// //     if (env.dataFetcher.getLastUpdateBlock() >= minBlockNumber) return
// //     await delay(500)
// //   }
// // }

// async function updMakeSwap(
//   env: TestEnvironment,
//   fromToken: Type,
//   toToken: Type,
//   lastCallResult: BigNumber | [BigNumber | undefined, number],
//   providers?: LiquidityProviders[],
//   poolFilter?: PoolFilter,
//   makeSankeyDiagram = false
// ): Promise<[BigNumber | undefined, number]> {
//   const [amountIn, waitBlock] = lastCallResult instanceof BigNumber ? [lastCallResult, 1] : lastCallResult
//   if (amountIn === undefined) return [undefined, waitBlock] // previous swap failed

//   // console.log('')
//   // //console.log('Wait data update for min block', waitBlock)
//   // await dataUpdated(env, waitBlock)
  
//   const currencyCombination = getCurrencyCombinations(env.chainId, fromToken, toToken)
//   const poolCodeMap = await TestDataFetcher.getPairs(
//     env.chainId,
//     env.provider,
//     LiquidityProviders.SushiSwap,
//     currencyCombination
//   )

//   const res = await makeSwap(env, fromToken, amountIn, toToken, poolCodeMap)
//   expect(res).not.undefined
//   if (res === undefined) return [undefined, waitBlock]
//   else return res
// }

// async function checkTransferAndRoute(
//   env: TestEnvironment,
//   fromToken: Type,
//   toToken: Type,
//   lastCallResult: BigNumber | [BigNumber | undefined, number],
//   providers?: LiquidityProviders[],
// ): Promise<[BigNumber | undefined, number]> {
//   const [amountIn, waitBlock] = lastCallResult instanceof BigNumber ? [lastCallResult, 1] : lastCallResult
//   if (amountIn === undefined) return [undefined, waitBlock] // previous swap failed
//   // await dataUpdated(env, waitBlock)

//   if (fromToken instanceof Token) {
//     const WrappedBaseTokenContract = await new ethers.Contract(fromToken.address, erc20Abi, env.user)
//     await WrappedBaseTokenContract.connect(env.user).approve(env.rp.address, amountIn)
//   }

//   const poolsCodeMap = new Map()
//   const route = Router.findBestRoute(poolsCodeMap, env.chainId, fromToken, amountIn, toToken, 30e9, providers ?? [LiquidityProviders.SushiSwap])

//   const rpParams = Router.routeProcessor2Params(
//     poolsCodeMap,
//     route,
//     fromToken,
//     toToken,
//     env.user.address,
//     env.rp.address
//   )
//   const transferValue = getBigNumber(0.02 * Math.pow(10, Native.onChain(env.chainId).decimals))
//   rpParams.value = (rpParams.value || BigNumber.from(0)).add(transferValue)

//   const balanceUser2Before = await env.user2.getBalance()

//   let balanceOutBNBefore: BigNumber
//   let toTokenContract: Contract | undefined = undefined
//   if (toToken instanceof Token) {
//     toTokenContract = await new ethers.Contract(toToken.address, weth9Abi, env.user)
//     balanceOutBNBefore = await toTokenContract.connect(env.user).balanceOf(env.user.address)
//   } else {
//     balanceOutBNBefore = await env.user.getBalance()
//   }
//   const tx = await env.rp.transferValueAndprocessRoute(
//     env.user2.address,
//     transferValue,
//     rpParams.tokenIn,
//     rpParams.amountIn,
//     rpParams.tokenOut,
//     rpParams.amountOutMin,
//     rpParams.to,
//     rpParams.routeCode,
//     { value: rpParams.value }
//   )
//   const receipt = await tx.wait()

//   let balanceOutBN: BigNumber
//   if (toTokenContract) {
//     balanceOutBN = (await toTokenContract.connect(env.user).balanceOf(env.user.address)).sub(balanceOutBNBefore)
//   } else {
//     balanceOutBN = (await env.user.getBalance()).sub(balanceOutBNBefore)
//     balanceOutBN = balanceOutBN.add(receipt.effectiveGasPrice.mul(receipt.gasUsed))
//     balanceOutBN = balanceOutBN.add(transferValue)
//   }
//   expect(balanceOutBN.gte(rpParams.amountOutMin)).equal(true)

//   const balanceUser2After = await env.user2.getBalance()
//   const transferredValue = balanceUser2After.sub(balanceUser2Before)
//   expect(transferredValue.eq(transferValue)).equal(true)

//   return [balanceOutBN, receipt.blockNumber]
// }

// // skipped because took too long time. Unskip to check the RP
// describe('End-to-end Router2 test', async function () {
//   let env: TestEnvironment
//   let chainId: ChainId
//   let intermidiateResult: [BigNumber | undefined, number] = [undefined, 1]
//   let testTokensSet: (Type | undefined)[]
//   let SUSHI_LOCAL: Token
//   let USDC_LOCAL: Token

//   before(async () => {
//     env = await getTestEnvironment()
//     chainId = env.chainId

//     type SUSHI_CHAINS = keyof typeof SUSHI_ADDRESS
//     type USDC_CHAINS = keyof typeof USDC_ADDRESS
//     type USDT_CHAINS = keyof typeof USDT_ADDRESS
//     type DAI_CHAINS = keyof typeof DAI_ADDRESS
//     type FRAX_CHAINS = keyof typeof FRAX_ADDRESS
//     type FXS_CHAINS = keyof typeof FXS_ADDRESS
//     SUSHI_LOCAL = SUSHI[chainId as SUSHI_CHAINS]
//     USDC_LOCAL = USDC[chainId as USDC_CHAINS]
//     testTokensSet = [
//       Native.onChain(chainId),
//       WNATIVE[chainId],
//       SUSHI[chainId as SUSHI_CHAINS],
//       USDC[chainId as USDC_CHAINS],
//       USDT[chainId as USDT_CHAINS],
//       DAI[chainId as DAI_CHAINS],
//       FRAX[chainId as FRAX_CHAINS],
//       FXS[chainId as FXS_CHAINS],
//     ]
//   })

//   it('Native => SUSHI => Native', async function () {
//     intermidiateResult[0] = getBigNumber(1000000 * 1e18)
//     intermidiateResult = await updMakeSwap(env, Native.onChain(chainId), SUSHI_LOCAL, intermidiateResult)
//     intermidiateResult = await updMakeSwap(env, SUSHI_LOCAL, Native.onChain(chainId), intermidiateResult)
//   })

//   it('Native => WrappedNative => Native', async function () {
//     intermidiateResult[0] = getBigNumber(1 * 1e18)
//     intermidiateResult = await updMakeSwap(env, Native.onChain(chainId), WNATIVE[chainId], intermidiateResult)
//     intermidiateResult = await updMakeSwap(env, WNATIVE[chainId], Native.onChain(chainId), intermidiateResult)
//   })

//   it('Trident Native => SUSHI => Native (Polygon only)', async function () {
//     if (chainId == ChainId.POLYGON) {
//       intermidiateResult[0] = getBigNumber(10_000 * 1e18)
//       intermidiateResult = await updMakeSwap(env, Native.onChain(chainId), SUSHI[chainId], intermidiateResult, [
//         LiquidityProviders.Trident,
//       ])
//       intermidiateResult = await updMakeSwap(env, SUSHI[chainId], Native.onChain(chainId), intermidiateResult, [
//         LiquidityProviders.Trident,
//       ])
//     }
//   })

//   it('StablePool Native => USDC => USDT => DAI => USDC (Polygon only)', async function () {
//     const filter = (pool: RPool) => pool instanceof StableSwapRPool || pool instanceof BridgeBento
//     if (chainId == ChainId.POLYGON) {
//       intermidiateResult[0] = getBigNumber(10_000 * 1e18)
//       intermidiateResult = await updMakeSwap(env, Native.onChain(chainId), USDC[chainId], intermidiateResult)
//       intermidiateResult = await updMakeSwap(env, USDC[chainId], USDT[chainId], intermidiateResult, undefined, filter)
//       intermidiateResult = await updMakeSwap(env, USDT[chainId], DAI[chainId], intermidiateResult, undefined, filter)
//       intermidiateResult = await updMakeSwap(env, DAI[chainId], USDC[chainId], intermidiateResult, undefined, filter)
//     }
//   })

//   function getNextToken(rnd: () => number, previousTokenIndex: number): number {
//     for (;;) {
//       const next = Math.floor(rnd() * testTokensSet.length)
//       if (next == previousTokenIndex) continue
//       if (testTokensSet[next] === undefined) continue
//       return next
//     }
//   }

//   it.skip('Random swap test', async function () {
//     const testSeed = '10' // Change it to change random generator values
//     const rnd: () => number = seedrandom(testSeed) // random [0, 1)
//     let routeCounter = 0
//     for (let i = 0; i < 100; ++i) {
//       let currentToken = 0
//       intermidiateResult[0] = getBigNumber(getRandomExp(rnd, 1e15, 1e24))
//       for (;;) {
//         const nextToken = getNextToken(rnd, currentToken)
//         console.log('Round # ', i + 1, ' Total Route # ', ++routeCounter)
//         intermidiateResult = await updMakeSwap(
//           env,
//           testTokensSet[currentToken] as Type,
//           testTokensSet[nextToken] as Type,
//           intermidiateResult
//         )
//         currentToken = nextToken
//         if (currentToken == 0) break
//       }
//     }
//   })

//   it('Special Router', async function () {
//     const poolsCodeMap = new Map() // TODO: fetch route
//     const route = Router.findSpecialRoute(
//       poolsCodeMap,
//       env.chainId,
//       Native.onChain(chainId),
//       getBigNumber(1 * 1e18),
//       SUSHI_LOCAL,
//       30e9
//     )
//     expect(route).not.undefined
//   })

//   if (network.config.chainId == ChainId.POLYGON) {
//     it('Transfer value and route 1', async function () {
//       intermidiateResult[0] = getBigNumber(1e18)
//       intermidiateResult = await checkTransferAndRoute(env, Native.onChain(chainId), SUSHI_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, SUSHI_LOCAL, USDC_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, USDC_LOCAL, Native.onChain(chainId), intermidiateResult)
//     })

//     it('Transfer value and route 2', async function () {
//       intermidiateResult[0] = getBigNumber(1e18)
//       intermidiateResult = await checkTransferAndRoute(
//         env,
//         Native.onChain(chainId),
//         WNATIVE[chainId],
//         intermidiateResult
//       )
//       intermidiateResult = await checkTransferAndRoute(env, WNATIVE[chainId], SUSHI_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, SUSHI_LOCAL, WNATIVE[chainId], intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(
//         env,
//         WNATIVE[chainId],
//         Native.onChain(chainId),
//         intermidiateResult
//       )
//     })

//     it('Transfer value and route 3 - check EOA', async function () {
//       intermidiateResult[0] = getBigNumber(1e18)
//       env.user2 = await ethers.getSigner('0x0000000000000000000000000000000000000001')
//       intermidiateResult = await checkTransferAndRoute(env, Native.onChain(chainId), SUSHI_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, SUSHI_LOCAL, USDC_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, USDC_LOCAL, Native.onChain(chainId), intermidiateResult)
//     })

//     it('Transfer value and route 4 - not payable address', async function () {
//       intermidiateResult[0] = getBigNumber(1e18)
//       env.user2 = await ethers.getSigner('0x597A9bc3b24C2A578CCb3aa2c2C62C39427c6a49')
//       let throwed = false
//       try {
//         await checkTransferAndRoute(env, Native.onChain(chainId), SUSHI_LOCAL, intermidiateResult)
//       } catch (e) {
//         throwed = true
//       }
//       expect(throwed, 'Transfer value to not payable address should fail').equal(true)
//     })
//   }
// })
