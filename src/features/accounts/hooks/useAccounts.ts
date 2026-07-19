import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/httpClient'
import {
  disconnectAccount,
  getAccountSession,
  logout,
  refreshAccount,
  selectAccount
} from '../api/accounts.api'
import type { AccountSession } from '../types/accounts.types'

export type AccountsState =
  | Readonly<{ status: 'loading'; session: null; message: null }>
  | Readonly<{ status: 'empty'; session: null; message: null }>
  | Readonly<{ status: 'success'; session: AccountSession; message: null }>
  | Readonly<{ status: 'error'; session: null; message: string }>

export function useAccounts() {
  const [state, setState] = useState<AccountsState>({
    status: 'loading',
    session: null,
    message: null
  })
  const [isWorking, setIsWorking] = useState(false)

  const load = useCallback(async () => {
    setState({ status: 'loading', session: null, message: null })

    try {
      const session = await getAccountSession()
      setState({ status: 'success', session, message: null })
    } catch (error: unknown) {
      if (
        error instanceof ApiError &&
        (error.code === 'AUTHENTICATION_REQUIRED' ||
          error.code === 'SESSION_NOT_FOUND')
      ) {
        setState({ status: 'empty', session: null, message: null })
        return
      }

      setState({
        status: 'error',
        session: null,
        message:
          error instanceof ApiError
            ? error.message
            : 'Unable to load account information.'
      })
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    void getAccountSession()
      .then((session) => {
        if (isMounted) {
          setState({ status: 'success', session, message: null })
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }

        if (
          error instanceof ApiError &&
          (error.code === 'AUTHENTICATION_REQUIRED' ||
            error.code === 'SESSION_NOT_FOUND')
        ) {
          setState({ status: 'empty', session: null, message: null })
          return
        }

        setState({
          status: 'error',
          session: null,
          message:
            error instanceof ApiError
              ? error.message
              : 'Unable to load account information.'
        })
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const synchronizeAccountSession = () => {
      void load()
    }

    window.addEventListener(
      'deriv-account-session-changed',
      synchronizeAccountSession
    )

    return () => {
      window.removeEventListener(
        'deriv-account-session-changed',
        synchronizeAccountSession
      )
    }
  }, [load])

  const run = useCallback(async (operation: () => Promise<AccountSession>) => {
    setIsWorking(true)

    try {
      const session = await operation()
      setState({ status: 'success', session, message: null })
      window.dispatchEvent(new Event('deriv-account-session-changed'))
    } catch (error: unknown) {
      setState({
        status: 'error',
        session: null,
        message:
          error instanceof ApiError
            ? error.message
            : 'Unable to complete the account action.'
      })
    } finally {
      setIsWorking(false)
    }
  }, [])

  const chooseAccount = useCallback(
    (accountId: string) => run(() => selectAccount(accountId)),
    [run]
  )
  const refresh = useCallback(() => run(refreshAccount), [run])
  const disconnect = useCallback(
    (accountId?: string) => run(() => disconnectAccount(accountId)),
    [run]
  )
  const signOut = useCallback(async () => {
    setIsWorking(true)

    try {
      await logout()
      setState({ status: 'empty', session: null, message: null })
      window.dispatchEvent(new Event('deriv-account-session-changed'))
    } catch (error: unknown) {
      setState({
        status: 'error',
        session: null,
        message:
          error instanceof ApiError
            ? error.message
            : 'Unable to sign out safely.'
      })
    } finally {
      setIsWorking(false)
    }
  }, [])

  return { state, isWorking, load, chooseAccount, refresh, disconnect, signOut }
}
