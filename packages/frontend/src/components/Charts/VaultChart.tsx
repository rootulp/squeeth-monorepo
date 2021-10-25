import { createStyles, makeStyles, TextField, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import dynamic from 'next/dynamic'
import React, { useMemo, useState } from 'react'

import { graphOptions, Vaults } from '../../constants'
import { useWorldContext } from '../../context/world'
import { useETHPrice } from '../../hooks/useETHPrice'
import IV from '../IV'
import { SqueethTab, SqueethTabs } from '../Tabs'
import ShortSqueethPayoff from './ShortSqueethPayoff'

const Chart = dynamic(() => import('kaktana-react-lightweight-charts'), { ssr: false })

const useStyles = makeStyles((theme) =>
  createStyles({
    navDiv: {
      display: 'flex',
      marginBottom: theme.spacing(2),
      alignItems: 'center',
    },
    chartNav: {
      border: `1px solid ${theme.palette.primary.main}30`,
    },
    cardDetail: {
      color: theme.palette.text.secondary,
      lineHeight: '1.75rem',
      fontSize: '16px',
      marginTop: theme.spacing(4),
      maxWidth: '800px',
    },
    cardTitle: {
      color: theme.palette.primary.main,
      marginTop: theme.spacing(2),
    },
    header: {
      color: theme.palette.primary.main,
    },
  }),
)

export function VaultChart({
  vault,
  longAmount,
  setCustomLong,
  showPercentage,
}: {
  vault?: Vaults
  longAmount: number
  setCustomLong: Function
  showPercentage: boolean
}) {
  const {
    startingETHPrice,
    getVaultPNLWithRebalance,
    days,
    setDays,
    longEthPNL,
    shortEthPNL,
    getStableYieldPNL,
    shortSeries,
    collatRatio,
  } = useWorldContext()

  const ethPrice = useETHPrice()

  const seriesRebalance = getVaultPNLWithRebalance(longAmount)
  const classes = useStyles()
  const [chartType, setChartType] = useState(0)

  const startTimestamp = useMemo(() => (seriesRebalance.length > 0 ? seriesRebalance[0].time : 0), [seriesRebalance])
  const endTimestamp = useMemo(
    () => (seriesRebalance.length > 0 ? seriesRebalance[seriesRebalance.length - 1].time : 0),
    [seriesRebalance],
  )

  const lineSeries = useMemo(() => {
    if (vault === Vaults.ETHBull)
      return [
        { data: longEthPNL, legend: 'Long ETH' },
        { data: seriesRebalance, legend: 'ETH Bull Strategy (incl. funding)' },
      ]
    if (vault === Vaults.CrabVault)
      return [
        { data: seriesRebalance, legend: 'Crab Strategy PNL (incl. funding)' },
        { data: getStableYieldPNL(longAmount), legend: 'Compound Interest yield' },
      ]
    if (vault === Vaults.ETHBear)
      return [
        { data: shortEthPNL, legend: 'Short ETH' },
        { data: seriesRebalance, legend: 'ETH Bear Strategy (incl. funding)' },
      ]
    if (vault === Vaults.Short)
      return [
        { data: shortEthPNL, legend: 'Short ETH PNL' },
        { data: shortSeries, legend: 'Short Squeeth PNL (incl. funding)' },
      ]
    return [{ data: seriesRebalance, legend: 'PNL' }]
  }, [vault, longEthPNL, shortEthPNL, seriesRebalance, getStableYieldPNL, longAmount, shortSeries])

  const lineSeriesPercentage = useMemo(() => {
    if (vault === Vaults.ETHBull)
      return [
        { data: convertPNLToPriceChart(longEthPNL, startingETHPrice), legend: 'Long ETH' },
        {
          data: convertPNLToPriceChart(seriesRebalance, startingETHPrice),
          legend: 'ETH Bull Strategy (incl. funding)',
        },
      ]
    if (vault === Vaults.CrabVault)
      return [
        {
          data: convertPNLToPriceChart(getStableYieldPNL(longAmount), startingETHPrice),
          legend: 'Compound Interest Yield',
        },
        {
          data: convertPNLToPriceChart(seriesRebalance, startingETHPrice),
          legend: 'Crab Strategy PNL (incl. funding)',
        },
      ]
    if (vault === Vaults.ETHBear)
      return [
        { data: convertPNLToPriceChart(shortEthPNL, startingETHPrice), legend: 'Short ETH' },
        {
          data: convertPNLToPriceChart(seriesRebalance, startingETHPrice),
          legend: 'ETH Bear Strategy (incl. funding)',
        },
      ]
    if (vault === Vaults.Short)
      return [
        { data: convertPNLToPriceChart(shortEthPNL, startingETHPrice), legend: 'Short ETH' },
        { data: convertPNLToPriceChart(shortSeries, startingETHPrice), legend: 'Short Squeeth (incl. funding)' },
      ]
    return [{ data: seriesRebalance, legend: 'PNL' }]
  }, [vault, longEthPNL, shortEthPNL, seriesRebalance, getStableYieldPNL, longAmount, startingETHPrice, shortSeries])

  const chartOptions = useMemo(() => {
    if (showPercentage)
      return {
        ...graphOptions,
        priceScale: { mode: 2 },
        localization: {
          priceFormatter: (num: number) => num + '%',
        },
      }
    else return graphOptions
  }, [showPercentage])

  return (
    <div>
      <div className={classes.navDiv}>
        <SqueethTabs
          style={{ background: 'transparent' }}
          className={classes.chartNav}
          value={chartType}
          onChange={(evt, val) => setChartType(val)}
          aria-label="Sub nav tabs"
        >
          <SqueethTab label={`Predicted ${days}D PNL`} />
          <SqueethTab label="Payoff" />
          <SqueethTab label="Details" />
        </SqueethTabs>
        <TextField
          onChange={(event) => setDays(parseInt(event.target.value))}
          size="small"
          value={days}
          type="number"
          style={{ width: 150, marginLeft: '16px' }}
          label="Historical Days"
          variant="outlined"
        />
      </div>
      {seriesRebalance.length === 0 && <Alert severity="info"> Loading historical data, this could take a while</Alert>}
      {chartType === 0 ? (
        <Chart
          from={Math.floor(startTimestamp)}
          to={endTimestamp}
          // legend={`${vault} PNL`}
          options={chartOptions}
          lineSeries={showPercentage ? lineSeriesPercentage : lineSeries}
          autoWidth
          height={300}
          darkTheme
        />
      ) : chartType === 1 ? (
        <ShortSqueethPayoff ethPrice={ethPrice.toNumber()} collatRatio={collatRatio} />
      ) : (
        <div style={{ overflow: 'auto', maxHeight: '300px' }}>
          <Typography className={classes.cardTitle} variant="h6">
            What is short squeeth?
          </Typography>
          <Typography variant="body2" className={classes.cardDetail}>
            Short squeeth (ETH&sup2;) is short an ETH&sup2; position. You earn a funding rate for taking on this
            position. You enter the position by putting down collateral, minting, and selling squeeth. If you become
            undercollateralized, you could be liquidated.{' '}
            <a
              className={classes.header}
              href="https://opynopyn.notion.site/Squeeth-FAQ-4b6a054ab011454cbbd60cb3ee23a37c"
            >
              {' '}
              Learn more.{' '}
            </a>
          </Typography>
          <Typography className={classes.cardTitle} variant="h6">
            Risks
          </Typography>
          <Typography variant="body2" className={classes.cardDetail}>
            If you fall below the minimum collateralization threshold (150%), you are at risk of liquidation. If ETH
            moves approximately 6% in either direction, you are unprofitable.
            <br /> <br />
            Squeeth smart contracts are currently unaudited. This is experimental technology and we encourage caution
            only risking funds you can afford to lose.
          </Typography>
        </div>
      )}
      <br />
      {/* <IV /> */}
      {vault === Vaults.Custom && (
        <TextField
          onChange={(event) => setCustomLong(parseFloat(event.target.value))}
          size="small"
          value={longAmount}
          type="number"
          style={{ width: 300 }}
          label="ETH Long"
          variant="outlined"
        />
      )}
    </div>
  )
}

const convertPNLToPriceChart = (pnlSeries: { time: number; value: number }[], startingCapital: number) => {
  return pnlSeries.map(({ value, time }) => {
    return {
      value: value + startingCapital,
      time,
    }
  })
}
