import { useCallback, useEffect, useState } from 'react'
import { getAccountSession } from '../../accounts/api/accounts.api'
import { ApiError } from '../../../shared/api/httpClient'
import {
  downloadTradeHistory,
  getOpenTrades,
  getTradeHistory
} from '../api/records.api'
import type {
  RecordsConsoleData,
  TradeRecordFilters
} from '../types/records.types'

const initialFilters: TradeRecordFilters = {
  market: '',
  source: '',
  status: '',
  search: ''
}

export type TradeRecordsState =
  | Readonly<{ status: 'loading'; data: null; message: null }>
  | Readonly<{ status: 'empty'; data: null; message: string }>
  | Readonly<{ status: 'success'; data: RecordsConsoleData; message: null }>
  | Readonly<{ status: 'error'; data: null; message: string }>

function safeMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function useTradeRecords() {
  const [filters, setFilters] = useState<TradeRecordFilters>(initialFilters)
  const [state, setState] = useState<TradeRecordsState>({
    status: 'loading',
    data: null,
    message: null
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, message: null })
    try {
      const accountSession = await getAccountSession()
      if (accountSession.selectedAccountId === null) {
        setState({
          status: 'empty',
          data: null,
          message:
            'Select an authorized account before viewing its trade records.'
        })
        return
      }
      const [openTrades, history] = await Promise.all([
        getOpenTrades(filters),
        getTradeHistory(filters)
      ])
      setState({
        status: 'success',
        data: {
          accountSession,
          selectedAccountId: accountSession.selectedAccountId,
          openTrades,
          history
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
          message:
            'Connect and select a Deriv account before viewing trade records.'
        })
        return
      }
      setState({
        status: 'error',
        data: null,
        message: safeMessage(error, 'Unable to load trade records.')
      })
    }
  }, [filters])
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])
  const updateFilters = useCallback(
    (update: Partial<TradeRecordFilters>) =>
      setFilters((current) => ({ ...current, ...update })),
    []
  )
  const download = useCallback(async () => {
    setIsDownloading(true)
    setActionMessage(null)
    try {
      const csv = await downloadTradeHistory(filters)
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'deriv-trade-history.csv'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error: unknown) {
      setActionMessage(safeMessage(error, 'Unable to export trade history.'))
    } finally {
      setIsDownloading(false)
    }
  }, [filters])
  return {
    state,
    filters,
    updateFilters,
    isDownloading,
    actionMessage,
    download
  }
}
