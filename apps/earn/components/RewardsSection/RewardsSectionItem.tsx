import { Badge } from '@sushiswap/ui/future/components/Badge'
import { NetworkIcon } from '@sushiswap/ui'
import { Currency } from '@sushiswap/ui/future/components/currency'
import { unwrapToken } from '../../lib/functions'
import { formatNumber } from '@sushiswap/format'
import React, { FC, useMemo, useState } from 'react'
import { AngleRewardsPool } from '@sushiswap/react-query'
import { useTokenAmountDollarValues } from '../../lib/hooks'
import { Collapsible } from '@sushiswap/ui/future/components/animation/Collapsible'
import { format } from 'date-fns'
import { Token, tryParseAmount } from '@sushiswap/currency'
import { useBreakpoint } from '@sushiswap/ui/future'
import { Dialog } from '@sushiswap/ui/future/components/dialog'
import { List } from '@sushiswap/ui/future/components/list/List'
import { Explainer } from '@sushiswap/ui/future/components/Explainer'

interface RewardsSectionItem {
  data: AngleRewardsPool
}

const rewardPerDay = ({
  start,
  end,
  amount,
  tvl,
  userTVL,
  token,
}: {
  start: number
  end: number
  amount: number
  tvl: number
  userTVL: number
  token: Token
}) => {
  const days = (end - start) / 3600 / 24
  return tryParseAmount(((amount / days) * (userTVL / tvl)).toFixed(8), token)
}

export const RewardsSectionItem: FC<RewardsSectionItem> = ({ data }) => {
  const { isMd } = useBreakpoint('md')

  const unclaimed = useMemo(() => Object.values(data.rewardsPerToken).map((el) => el.unclaimed), [data])
  const dollarValues = useTokenAmountDollarValues({ chainId: data.chainId, amounts: unclaimed })
  const [open, setOpen] = useState(false)

  return (
    <div className="py-4 flex flex-col gap-1">
      <div
        role="button"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-center"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-4">
          <div className="min-w-[52px]">
            <Badge
              className="border-2 border-gray-100 dark:border-slate-900 rounded-full z-[11] !bottom-0 right-[-15%]"
              position="bottom-right"
              badgeContent={<NetworkIcon chainId={data.chainId} width={20} height={20} />}
            >
              <Currency.IconList iconWidth={40} iconHeight={40}>
                <Currency.Icon currency={data.token0} />
                <Currency.Icon currency={data.token1} />
              </Currency.IconList>
            </Badge>
          </div>
          <div className="flex flex-col items-baseline gap-[1px]">
            <span className="text-sm font-medium flex items-baseline gap-1 text-gray-900 dark:text-slate-50">
              {unwrapToken(data.token0).symbol} <span className="font-normal text-gray-900 dark:text-slate-500">/</span>{' '}
              {unwrapToken(data.token1).symbol}
              <span className="text-xs text-gray-500 dark:text-slate-500">{data.poolFee}%</span>
            </span>
            <div className="rounded-full px-2 py-0.5 text-xs bg-black/[0.06] dark:bg-white/[0.06]">
              {data.distributionData.length} Ongoing Farms
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end lg:items-start">
          <span className="text-xs text-gray-600 dark:text-slate-400">Position Size</span>
          <span className="text-sm font-medium">${formatNumber(data.userTVL)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-600 dark:text-slate-400">Average APR</span>
          <span className="text-sm font-medium">{formatNumber(data.meanAPR)}%</span>
        </div>
        <div className="flex flex-col items-end lg:items-start">
          <span className="text-xs text-gray-600 dark:text-slate-400">Claimable</span>
          <span className="text-sm font-medium">${dollarValues.reduce((acc, cur) => acc + +formatNumber(cur), 0)}</span>
        </div>
      </div>
      {isMd ? (
        <Collapsible open={open}>
          <div className="py-4">
            <div className="h-px bg-gray-200 dark:bg-slate-200/5 w-full" />
          </div>
          <div className="pb-3 grid grid-cols-3">
            <span className="text-xs font-semibold text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 whitespace-nowrap">
              Your reward
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 whitespace-nowrap">
              Details
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 whitespace-nowrap">
              Duration
            </span>
          </div>
          <div className="flex flex-col gap-3 divide-y divide-gray-200 dark:divide-slate-200/5">
            {data.distributionData
              .filter((el) => el.end * 1000 >= Date.now())
              .map(({ start, end, amount, token, propToken1, propFees, propToken0 }) => (
                <div className="grid grid-cols-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Currency.Icon currency={token} width={30} height={30} />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {rewardPerDay({
                          start,
                          end,
                          amount,
                          tvl: data.tvl ?? 0,
                          userTVL: data.userTVL ?? 0,
                          token,
                        })?.toSignificant(8)}{' '}
                        {token.symbol}{' '}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-500">per day</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {propFees}% / {propToken0}% / {propToken1}%
                    </span>
                    <span className="flex gap-1 items-center text-xs text-gray-500 dark:text-slate-500">
                      Fees / {data.token0.symbol} / {data.token1.symbol}{' '}
                      <Explainer hover iconSize={14} placement="bottom">
                        Weight that fees earned by positions represent in their rewards score. A higher % means that
                        more rewards will be attributed to positions that earn more fees during the distribution.
                      </Explainer>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mediumt">{Math.floor((end - Date.now() / 1000) / 3600 / 24)} days left</span>
                    <span className="text-xs text-gray-500 dark:text-slate-500">
                      Ends at: {format(end * 1000, 'dd MMM yyyy hh:mm')}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Collapsible>
      ) : (
        <Dialog open={open} onClose={() => setOpen(false)}>
          <Dialog.Content>
            <div className="flex items-center gap-4">
              <div className="min-w-[52px]">
                <Badge
                  className="border-2 border-gray-100 dark:border-slate-900 rounded-full z-[11] !bottom-0 right-[-15%]"
                  position="bottom-right"
                  badgeContent={<NetworkIcon chainId={data.chainId} width={20} height={20} />}
                >
                  <Currency.IconList iconWidth={40} iconHeight={40}>
                    <Currency.Icon currency={data.token0} />
                    <Currency.Icon currency={data.token1} />
                  </Currency.IconList>
                </Badge>
              </div>
              <div className="flex flex-col items-baseline gap-[1px]">
                <span className="text-sm font-medium flex items-baseline gap-1 text-gray-900 dark:text-slate-50">
                  {unwrapToken(data.token0).symbol}{' '}
                  <span className="font-normal text-gray-900 dark:text-slate-500">/</span>{' '}
                  {unwrapToken(data.token1).symbol}
                  <span className="text-xs text-gray-500 dark:text-slate-500">{data.poolFee}%</span>
                </span>
                <div className="rounded-full px-2 py-0.5 text-xs bg-black/[0.06] dark:bg-white/[0.06]">
                  {data.distributionData.length} Ongoing Farms
                </div>
              </div>
            </div>
            <List className="mt-4">
              <List.Label>Position details</List.Label>
              <List.Control>
                <List.KeyValue title="Position Size">${formatNumber(data.userTVL)}</List.KeyValue>
                <List.KeyValue title="Average APR">{formatNumber(data.meanAPR)}%</List.KeyValue>
                <List.KeyValue flex title="Claimable">
                  ${dollarValues.reduce((acc, cur) => acc + +formatNumber(cur), 0)}
                </List.KeyValue>
              </List.Control>
            </List>
            <List className="mt-4">
              <List.Label className="text-blue font-medium">Farms ({data.distributionData.length})</List.Label>
              <List.Control>
                {data.distributionData
                  .filter((el) => el.end * 1000 >= Date.now())
                  .map(({ start, end, amount, token, propFees, propToken0, propToken1 }, i) => (
                    <>
                      <List.Label className="!text-[10px] !px-4 pt-4 uppercase font-semibold !text-gray-400 !dark:text-slate-500">
                        Farm {i + 1}
                      </List.Label>
                      <List.KeyValue flex title="Reward" subtitle="per day">
                        <div className="flex items-center gap-2">
                          <Currency.Icon currency={token} width={18} height={18} />
                          {rewardPerDay({
                            start,
                            end,
                            amount,
                            tvl: data.tvl ?? 0,
                            userTVL: data.userTVL ?? 0,
                            token,
                          })?.toSignificant(6)}{' '}
                          {unwrapToken(token).symbol}
                        </div>
                      </List.KeyValue>
                      <List.KeyValue flex title="Duration">
                        <div className="flex flex-col">
                          <span className="font-mediumt">
                            {Math.floor((end - Date.now() / 1000) / 3600 / 24)} days left
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-500">
                            Ends at: {format(end * 1000, 'dd MMM yyyy hh:mm')}
                          </span>
                        </div>
                      </List.KeyValue>
                      <List.KeyValue
                        flex
                        title={
                          <div className="flex gap-1 items-center">
                            Details
                            <Explainer iconSize={16} placement="bottom">
                              Weight that fees earned by positions represent in their rewards score. A higher % means
                              that more rewards will be attributed to positions that earn more fees during the
                              distribution.
                            </Explainer>
                          </div>
                        }
                        subtitle="Reward weights (%)"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {propFees}% / {propToken0}% / {propToken1}%
                          </span>
                          <span className="flex gap-1 items-center text-xs text-gray-500 dark:text-slate-500">
                            Fees / {data.token0.symbol} / {data.token1.symbol}
                          </span>
                        </div>
                      </List.KeyValue>
                    </>
                  ))}
              </List.Control>
            </List>
          </Dialog.Content>
        </Dialog>
      )}
    </div>
  )
}
