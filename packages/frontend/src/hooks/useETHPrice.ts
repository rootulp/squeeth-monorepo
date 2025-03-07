import BigNumber from 'bignumber.js'
import { useQuery, useQueryClient } from 'react-query'

import { useController } from './contracts/useController'
import { toTokenAmount } from '@utils/calculations'

const ethPriceQueryKeys = {
  currentEthPrice: () => ['currentEthPrice'],
}

/**
 * get token price by address.
 * @param token token address
 * @param refetchIntervalSec refetch interval in seconds
 * @returns {BigNumber} price denominated in USD
 */
export const useETHPrice = (refetchIntervalSec = 30) => {
  const queryClient = useQueryClient()
  const { index } = useController()

  const ethPrice = useQuery(ethPriceQueryKeys.currentEthPrice(), () => getETHPriceCoingecko(), {
    onError() {
      queryClient.setQueryData(ethPriceQueryKeys.currentEthPrice(), toTokenAmount(index, 18).sqrt())
    },
    refetchInterval: refetchIntervalSec * 1000,
    refetchOnWindowFocus: true,
  })

  return ethPrice.data ?? new BigNumber(0)
}

export const getETHPriceCoingecko = async (): Promise<BigNumber> => {
  const coin = 'ethereum'

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`

  const res = await fetch(url)
  const priceStruct: { usd: number } = (await res.json())[coin.toLowerCase()]
  if (priceStruct === undefined) throw new Error('Error getting ethPrice from Coingecko')
  const price = priceStruct.usd
  return new BigNumber(price)
}

export const getHistoricEthPrice = async (dateString: string): Promise<BigNumber> => {
  const pair = 'ETH/USD'

  const response = await fetch(
    `https://api.twelvedata.com/time_series?start_date=${dateString}&end_date=${dateString}&symbol=${pair}&interval=1min&apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_APIKEY}`,
  ).then((res) => res.json())

  if (response.status === 'error') {
    throw new Error(response.status)
  }

  return new BigNumber(Number(response.values[0].close))
}
