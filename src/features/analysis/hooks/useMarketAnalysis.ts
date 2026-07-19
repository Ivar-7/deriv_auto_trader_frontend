import { useCallback, useEffect, useState } from 'react'
import { getAccountSession } from '../../accounts/api/accounts.api'
import type { AccountSession } from '../../accounts/types/accounts.types'
import { ApiError } from '../../../shared/api/httpClient'
import {
  getMarketAnalysis,
  getActiveSymbols,
  getScanner,
  replayMarket,
  subscribeToMarket,
  subscribeToScanner,
  unsubscribeFromMarket
} from '../api/analysis.api'
import type {
  ActiveMarketSymbol,
  AnalysisParameters,
  MarketConsoleData,
  MarketScannerObservation,
  ReplayTickInput
} from '../types/analysis.types'

export type MarketConsoleState =
  | Readonly<{
      status: 'loading'
      accountSession: null
      data: null
      message: null
    }>
  | Readonly<{
      status: 'empty'
      accountSession: AccountSession | null
      data: null
      message: string
    }>
  | Readonly<{
      status: 'success'
      accountSession: AccountSession
      data: MarketConsoleData
      message: null
    }>
  | Readonly<{
      status: 'error'
      accountSession: null
      data: null
      message: string
    }>

function safeMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function useMarketAnalysis() {
  const [state, setState] = useState<MarketConsoleState>({
    status: 'loading',
    accountSession: null,
    data: null,
    message: null
  })
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [scannerMarkets, setScannerMarkets] = useState<readonly string[]>([])
  const [availableMarkets, setAvailableMarkets] = useState<
    readonly ActiveMarketSymbol[]
  >([])

  useEffect(() => {
    void getAccountSession()
      .then((accountSession) => {
        if (accountSession.selectedAccountId === null) {
          setState({
            status: 'empty',
            accountSession,
            data: null,
            message:
              'Select an authorized account before connecting a market feed.'
          })
          return
        }

        setState({
          status: 'empty',
          accountSession,
          data: null,
          message: 'Choose a market to begin a read-only tick subscription.'
        })
        void getActiveSymbols()
          .then(setAvailableMarkets)
          .catch((error: unknown) => {
            setActionMessage(
              safeMessage(error, 'Unable to load Deriv active symbols.')
            )
          })
      })
      .catch((error: unknown) => {
        if (
          error instanceof ApiError &&
          (error.code === 'AUTHENTICATION_REQUIRED' ||
            error.code === 'SESSION_NOT_FOUND')
        ) {
          setState({
            status: 'empty',
            accountSession: null,
            data: null,
            message: 'Connect a Deriv account before opening market analysis.'
          })
          return
        }

        setState({
          status: 'error',
          accountSession: null,
          data: null,
          message: safeMessage(error, 'Unable to load account context.')
        })
      })
  }, [])

  const startMarket = useCallback(
    async (market: string, parameters: AnalysisParameters) => {
      const accountSession = state.accountSession

      if (
        accountSession === null ||
        accountSession.selectedAccountId === null
      ) {
        return
      }

      setIsWorking(true)
      setActionMessage(null)

      try {
        if (
          state.status === 'success' &&
          state.data.analysis.market !== market
        ) {
          await unsubscribeFromMarket(state.data.analysis.market)
        }
        await subscribeToMarket(market)
        const analysis = await getMarketAnalysis(market, parameters)
        setState({
          status: 'success',
          accountSession,
          data: {
            accountSession,
            selectedAccountId: accountSession.selectedAccountId,
            analysis,
            scanner: []
          },
          message: null
        })
      } catch (error: unknown) {
        setActionMessage(
          safeMessage(error, 'Unable to connect the requested market feed.')
        )
      } finally {
        setIsWorking(false)
      }
    },
    [state]
  )

  const refresh = useCallback(
    async (parameters: AnalysisParameters) => {
      if (state.status !== 'success') {
        return
      }

      try {
        const {
          accountSession,
          selectedAccountId,
          analysis: currentAnalysis
        } = state.data
        const [analysis, scanner] = await Promise.all([
          getMarketAnalysis(currentAnalysis.market, parameters),
          scannerMarkets.length === 0
            ? Promise.resolve([])
            : getScanner(scannerMarkets)
        ])
        setState({
          status: 'success',
          accountSession,
          data: { accountSession, selectedAccountId, analysis, scanner },
          message: null
        })
      } catch (error: unknown) {
        setActionMessage(
          safeMessage(
            error,
            'The latest market analysis could not be refreshed.'
          )
        )
      }
    },
    [scannerMarkets, state]
  )

  useEffect(() => {
    if (state.status !== 'success') {
      return
    }

    const parameters = state.data.analysis.parameters
    const interval = window.setInterval(() => {
      void refresh(parameters)
    }, 3_000)

    return () => window.clearInterval(interval)
  }, [refresh, state])

  const startScanner = useCallback(
    async (markets: readonly string[]) => {
      if (state.status !== 'success') {
        return
      }

      setIsWorking(true)
      setActionMessage(null)

      try {
        const scanner = await subscribeToScanner(markets)
        setScannerMarkets(markets)
        setState({
          ...state,
          data: { ...state.data, scanner }
        })
      } catch (error: unknown) {
        setActionMessage(
          safeMessage(error, 'Unable to connect the scanner markets.')
        )
      } finally {
        setIsWorking(false)
      }
    },
    [state]
  )

  const replay = useCallback(
    async (market: string, ticks: readonly ReplayTickInput[]) => {
      if (state.accountSession?.selectedAccountId === null) return
      setIsWorking(true)
      setActionMessage(null)
      try {
        await unsubscribeFromMarket(market)
        const analysis = await replayMarket(market, ticks)
        const accountSession = state.accountSession
        if (
          accountSession === null ||
          accountSession.selectedAccountId === null
        )
          return
        setState({
          status: 'success',
          accountSession,
          data: {
            accountSession,
            selectedAccountId: accountSession.selectedAccountId,
            analysis,
            scanner: []
          },
          message: null
        })
      } catch (error: unknown) {
        setActionMessage(safeMessage(error, 'Unable to replay the tick data.'))
      } finally {
        setIsWorking(false)
      }
    },
    [state]
  )

  return {
    state,
    actionMessage,
    isWorking,
    availableMarkets,
    startMarket,
    refresh,
    startScanner,
    replay
  }
}

export type { MarketScannerObservation }
