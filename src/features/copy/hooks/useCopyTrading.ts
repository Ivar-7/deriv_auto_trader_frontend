import { useCallback, useEffect, useState } from 'react'
import { getAccountSession } from '../../accounts/api/accounts.api'
import { ApiError } from '../../../shared/api/httpClient'
import {
  actOnCopySession,
  actOnCopySubAccount,
  createCopySession,
  getCopySessions
} from '../api/copy.api'
import type {
  CopyAction,
  CopyConsoleData,
  CopySubAccountConfiguration
} from '../types/copy.types'

export type CopyTradingState =
  | Readonly<{ status: 'loading'; data: null; message: null }>
  | Readonly<{ status: 'empty'; data: null; message: string }>
  | Readonly<{ status: 'success'; data: CopyConsoleData; message: null }>
  | Readonly<{ status: 'error'; data: null; message: string }>

function safeMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function useCopyTrading() {
  const [state, setState] = useState<CopyTradingState>({
    status: 'loading',
    data: null,
    message: null
  })
  const [isWorking, setIsWorking] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, message: null })
    try {
      const accountSession = await getAccountSession()
      if (accountSession.accounts.length < 2) {
        setState({
          status: 'empty',
          data: null,
          message:
            'Authorize at least two Deriv accounts before configuring copy trading.'
        })
        return
      }
      const sessions = await getCopySessions()
      setState({
        status: 'success',
        data: { accountSession, sessions },
        message: null
      })
    } catch (error: unknown) {
      if (
        error instanceof ApiError &&
        ['AUTHENTICATION_REQUIRED', 'SESSION_NOT_FOUND'].includes(error.code)
      ) {
        setState({
          status: 'empty',
          data: null,
          message:
            'Connect your authorized Deriv accounts before opening Copy Trading.'
        })
        return
      }
      setState({
        status: 'error',
        data: null,
        message: safeMessage(error, 'Unable to load Copy Trading.')
      })
    }
  }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])
  const run = useCallback(
    async (work: () => Promise<unknown>, fallback: string) => {
      setIsWorking(true)
      setActionMessage(null)
      try {
        await work()
        await load()
      } catch (error: unknown) {
        setActionMessage(safeMessage(error, fallback))
      } finally {
        setIsWorking(false)
      }
    },
    [load]
  )
  const create = useCallback(
    async (
      masterAccountId: string,
      subAccounts: readonly CopySubAccountConfiguration[]
    ) =>
      run(
        () => createCopySession(masterAccountId, subAccounts),
        'Unable to start the copy-trading session.'
      ),
    [run]
  )
  const act = useCallback(
    async (sessionId: string, action: CopyAction) =>
      run(
        () => actOnCopySession(sessionId, action),
        'Unable to update this copy session.'
      ),
    [run]
  )
  const actSubAccount = useCallback(
    async (sessionId: string, accountId: string, action: CopyAction) =>
      run(
        () => actOnCopySubAccount(sessionId, accountId, action),
        'Unable to update this copy sub-account.'
      ),
    [run]
  )
  return { state, isWorking, actionMessage, create, act, actSubAccount }
}
