import { gql } from '@apollo/client'

export const SWAPS_ROPSTEN_SUBSCRIPTION = gql`
  subscription subscriptionSwapsRopsten(
    $poolAddress: String!
    $recipients: [String!]!
    $tokenAddress: Bytes!
    $origin: Bytes!
    $orderDirection: String!
    $recipient_not: Bytes!
  ) {
    swaps(
      orderBy: timestamp
      orderDirection: $orderDirection
      where: { pool: $poolAddress, origin: $origin, recipient_in: $recipients, recipient_not: $recipient_not }
    ) {
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      id
      timestamp
      recipient
      amount0
      amount1
      amountUSD
      origin
      transaction {
        id
        blockNumber
      }
    }
  }
`

export const SWAPS_ROPSTEN_QUERY = gql`
  query swapsRopsten(
    $poolAddress: String!
    $recipients: [String!]!
    $tokenAddress: Bytes!
    $origin: Bytes!
    $orderDirection: String!
  ) {
    swaps(
      orderBy: timestamp
      orderDirection: $orderDirection
      where: { pool: $poolAddress, origin: $origin, recipient_in: $recipients }
    ) {
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      id
      timestamp
      recipient
      amount0
      amount1
      amountUSD
      origin
      transaction {
        id
        blockNumber
      }
    }
  }
`
export default SWAPS_ROPSTEN_QUERY
