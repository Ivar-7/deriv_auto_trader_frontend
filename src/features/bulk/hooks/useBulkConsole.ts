import { useCallback, useEffect, useState } from 'react'
import { getAccountSession } from '../../accounts/api/accounts.api'
import { ApiError } from '../../../shared/api/httpClient'
import {
  actOnBulkRun,
  getAutoBulkProfiles,
  getBulkRuns,
  saveAutoBulkProfile,
  startBulkRun
} from '../api/bulk.api'
import type {
  AutoBulkProfile,
  BulkConsoleData,
  BulkRunConfiguration
} from '../types/bulk.types'

export type BulkConsoleState =
  | Readonly<{ status: 'loading'; data: null; message: null }>
  | Readonly<{ status: 'empty'; data: null; message: string }>
  | Readonly<{ status: 'success'; data: BulkConsoleData; message: null }>
  | Readonly<{ status: 'error'; data: null; message: string }>

function safeMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function useBulkConsole() {
  const [state, setState] = useState<BulkConsoleState>({
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
      if (accountSession.selectedAccountId === null) {
        setState({
          status: 'empty',
          data: null,
          message:
            'Select and connect an authorized account before managing bulk runs.'
        })
        return
      }
      const [runs, profiles] = await Promise.all([
        getBulkRuns(),
        getAutoBulkProfiles()
      ])
      setState({
        status: 'success',
        data: {
          accountSession,
          selectedAccountId: accountSession.selectedAccountId,
          runs,
          profiles
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
          message: 'Connect a Deriv account before opening Bulk Trader.'
        })
        return
      }
      setState({
        status: 'error',
        data: null,
        message: safeMessage(error, 'Unable to load Bulk Trader.')
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
  const start = useCallback(
    async (configuration: BulkRunConfiguration) =>
      run(
        () => startBulkRun(configuration),
        'Unable to start the manual bulk run.'
      ),
    [run]
  )
  const act = useCallback(
    async (runId: string, action: 'pause' | 'resume' | 'stop') =>
      run(() => actOnBulkRun(runId, action), 'Unable to update this bulk run.'),
    [run]
  )
  const saveProfile = useCallback(
    async (
      profile: Omit<
        AutoBulkProfile,
        'id' | 'accountId' | 'createdAt' | 'updatedAt'
      >
    ) =>
      run(
        () => saveAutoBulkProfile(profile),
        'Unable to save the Smart Auto Bulk profile.'
      ),
    [run]
  )
  return { state, isWorking, actionMessage, start, act, saveProfile }
}
