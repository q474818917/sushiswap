import { ChainId } from '@sushiswap/chain'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

import { getBuiltGraphSDK } from '.graphclient'

export const getServerSideProps: GetServerSideProps = async () => {
  // const { getBuiltGraphSDK } = await import('.graphclient')
  const sdk = await getBuiltGraphSDK()
  const { crossChainPairs: data } = await sdk.CrossChainPairs({
    chainIds: [ChainId.ETHEREUM, ChainId.ARBITRUM],
  })
  console.log({ data })
  return {
    props: {
      data,
    },
  }
}

export default function Index({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
