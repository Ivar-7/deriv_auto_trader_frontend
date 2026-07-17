import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/httpClient'
import {
  activateEmergencyStop,
  changeSessionState,
  clearEmergencyStop,
  getSafetyConsoleData,
  requestContractPreview,
  startGuardedSession,
  updateAccountRisk
} from '../api/automation.api'
import type {
  AccountRiskLimits,
  ContractPreview,
  ContractPreviewInput,
  SafetyConsoleData
} from '../types/automation.types'

export type SafetyConsoleState =
  | Readonly<{ status: 'loading'; data: null; message: null }>
  | Readonly<{ status: 'empty'; data: null; message: string }>
  | Readonly<{ status: 'success'; data: SafetyConsoleData; message: null }>
  | Readonly<{ status: 'error'; data: null; message: string }>

function toSafeMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function useSafetyConsole() {
  const [state, setState] = useState<SafetyConsoleState>({
    status: 'loading',
    data: null,
    message: null
  })
  const [preview, setPreview] = useState<ContractPreview | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(false)

  const readState = useCallback(async (): Promise<SafetyConsoleState> => {
    try {
      const result = await getSafetyConsoleData()

      if (result.selectedAccountId === null || result.snapshot === null) {
        return {
          status: 'empty',
          data: null,
          message:
            'Select an authorized account before opening the safety console.'
        }
      }

      return {
        status: 'success',
        data: {
          accountSession: result.accountSession,
          selectedAccountId: result.selectedAccountId,
          snapshot: result.snapshot
        },
        message: null
      }
    } catch (error: unknown) {
      if (
        error instanceof ApiError &&
        (error.code === 'AUTHENTICATION_REQUIRED' ||
          error.code === 'SESSION_NOT_FOUND')
      ) {
        return {
          status: 'empty',
          data: null,
          message: 'Connect a Deriv account before opening the safety console.'
        }
      }

      return {
        status: 'error',
        data: null,
        message: toSafeMessage(error, 'Unable to load the safety console.')
      }
    }
  }, [])

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, message: null })
    setState(await readState())
  }, [readState])

  useEffect(() => {
    void readState().then((nextState) => setState(nextState))
  }, [readState])

  const refreshAfterAction = useCallback(async () => {
    setPreview(null)
    await load()
  }, [load])

  const requestPreview = useCallback(
    async (input: ContractPreviewInput) => {
      setIsWorking(true)
      setActionMessage(null)

      try {
        const nextPreview = await requestContractPreview(input)
        setPreview(nextPreview)
        await load()
      } catch (error: unknown) {
        setActionMessage(
          toSafeMessage(error, 'Unable to create a guarded contract preview.')
        )
      } finally {
        setIsWorking(false)
      }
    },
    [load]
  )

  const startPreview = useCallback(async () => {
    if (preview === null) {
      return
    }

    setIsWorking(true)
    setActionMessage(null)

    try {
      await startGuardedSession(preview.id)
      await refreshAfterAction()
    } catch (error: unknown) {
      setActionMessage(
        toSafeMessage(error, 'Unable to start the guarded automation session.')
      )
    } finally {
      setIsWorking(false)
    }
  }, [preview, refreshAfterAction])

  const actOnSession = useCallback(
    async (sessionId: string, action: 'pause' | 'resume' | 'stop') => {
      setIsWorking(true)
      setActionMessage(null)

      try {
        await changeSessionState(sessionId, action)
        await refreshAfterAction()
      } catch (error: unknown) {
        setActionMessage(
          toSafeMessage(error, 'Unable to update the automation session.')
        )
      } finally {
        setIsWorking(false)
      }
    },
    [refreshAfterAction]
  )

  const saveAccountRisk = useCallback(
    async (limits: Omit<AccountRiskLimits, 'accountId'>) => {
      setIsWorking(true)
      setActionMessage(null)

      try {
        await updateAccountRisk(limits)
        await refreshAfterAction()
      } catch (error: unknown) {
        setActionMessage(
          toSafeMessage(error, 'Unable to save the account safety limits.')
        )
      } finally {
        setIsWorking(false)
      }
    },
    [refreshAfterAction]
  )

  const emergencyStop = useCallback(async () => {
    setIsWorking(true)
    setActionMessage(null)

    try {
      await activateEmergencyStop()
      await refreshAfterAction()
    } catch (error: unknown) {
      setActionMessage(
        toSafeMessage(error, 'Unable to activate Emergency Stop.')
      )
    } finally {
      setIsWorking(false)
    }
  }, [refreshAfterAction])

  const resetEmergencyStop = useCallback(async () => {
    setIsWorking(true)
    setActionMessage(null)

    try {
      await clearEmergencyStop()
      await refreshAfterAction()
    } catch (error: unknown) {
      setActionMessage(toSafeMessage(error, 'Unable to clear Emergency Stop.'))
    } finally {
      setIsWorking(false)
    }
  }, [refreshAfterAction])

  return {
    state,
    preview,
    actionMessage,
    isWorking,
    load,
    requestPreview,
    startPreview,
    actOnSession,
    saveAccountRisk,
    emergencyStop,
    resetEmergencyStop
  }
}
