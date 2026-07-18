import { useCallback, useEffect, useState } from 'react'
import { getAccountSession } from '../../accounts/api/accounts.api'
import { ApiError } from '../../../shared/api/httpClient'
import {
  evaluateScanner,
  getScannerMarkets,
  startScannerBulk,
  subscribeScanner
} from '../api/scanner.api'
import type {
  ScannerBulkConfiguration,
  ScannerConsoleData
} from '../types/scanner.types'

export type ScannerConsoleState =
  | Readonly<{ status: 'loading'; data: null; message: null }>
  | Readonly<{ status: 'empty'; data: null; message: string }>
  | Readonly<{ status: 'success'; data: ScannerConsoleData; message: null }>
  | Readonly<{ status: 'error'; data: null; message: string }>

function safeMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function useDiffersScanner() {
  const [state, setState] = useState<ScannerConsoleState>({
    status: 'loading',
    data: null,
    message: null
  })
  const [isWorking, setIsWorking] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [selectedMarkets, setSelectedMarkets] = useState<readonly string[]>([])
  const [minimumSignalStrength, setMinimumSignalStrength] = useState(1)

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, message: null })
    try {
      const accountSession = await getAccountSession()
      if (accountSession.selectedAccountId === null) {
        setState({
          status: 'empty',
          data: null,
          message:
            'Select and connect an authorized account before using the Differs Scanner.'
        })
        return
      }
      const markets = await getScannerMarkets()
      setState({
        status: 'success',
        data: {
          accountSession,
          selectedAccountId: accountSession.selectedAccountId,
          markets,
          results: []
        },
        message: null
      })
    } catch (error: unknown) {
      if (
        error instanceof ApiError &&
        [
          'AUTHENTICATION_REQUIRED',
          'SESSION_NOT_FOUND',
          'ACCOUNT_NOT_SELECTED'
        ].includes(error.code)
      ) {
        setState({
          status: 'empty',
          data: null,
          message: 'Connect a Deriv account before opening the Differs Scanner.'
        })
        return
      }
      setState({
        status: 'error',
        data: null,
        message: safeMessage(error, 'Unable to load scanner markets.')
      })
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const connect = useCallback(
    async (markets: readonly string[], minimum: number) => {
      if (state.status !== 'success') return
      setIsWorking(true)
      setActionMessage(null)
      try {
        const results = await subscribeScanner(markets, minimum)
        setSelectedMarkets(markets)
        setMinimumSignalStrength(minimum)
        setState({ ...state, data: { ...state.data, results } })
      } catch (error: unknown) {
        setActionMessage(
          safeMessage(
            error,
            'Unable to subscribe to the selected scanner markets.'
          )
        )
      } finally {
        setIsWorking(false)
      }
    },
    [state]
  )

  const refresh = useCallback(async () => {
    if (state.status !== 'success' || selectedMarkets.length === 0) return
    try {
      const results = await evaluateScanner(
        selectedMarkets,
        minimumSignalStrength
      )
      setState({ ...state, data: { ...state.data, results } })
    } catch (error: unknown) {
      setActionMessage(
        safeMessage(error, 'Unable to refresh scanner observations.')
      )
    }
  }, [minimumSignalStrength, selectedMarkets, state])

  useEffect(() => {
    if (state.status !== 'success' || selectedMarkets.length === 0) return
    const timer = window.setInterval(() => void refresh(), 3_000)
    return () => window.clearInterval(timer)
  }, [refresh, selectedMarkets.length, state.status])

  const startBulk = useCallback(
    async (market: string, configuration: ScannerBulkConfiguration) => {
      setIsWorking(true)
      setActionMessage(null)
      try {
        await startScannerBulk(market, minimumSignalStrength, configuration)
        setActionMessage(
          'Auto Bulk started from the confirmed Differs observation.'
        )
      } catch (error: unknown) {
        setActionMessage(
          safeMessage(
            error,
            'Unable to start Auto Bulk from this scanner signal.'
          )
        )
      } finally {
        setIsWorking(false)
      }
    },
    [minimumSignalStrength]
  )

  return {
    state,
    isWorking,
    actionMessage,
    selectedMarkets,
    minimumSignalStrength,
    connect,
    refresh,
    startBulk
  }
}
