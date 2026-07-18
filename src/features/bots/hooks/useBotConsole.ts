import { useCallback, useEffect, useState } from 'react'
import { getAccountSession } from '../../accounts/api/accounts.api'
import { ApiError } from '../../../shared/api/httpClient'
import {
  changeBotSessionState,
  evaluateBotSession,
  getBotConfigurations,
  getBotSessions,
  saveBotConfiguration,
  startBotSession
} from '../api/bots.api'
import type { BotConfiguration, BotConsoleData } from '../types/bots.types'

export type BotConsoleState =
  | Readonly<{ status: 'loading'; data: null; message: null }>
  | Readonly<{ status: 'empty'; data: null; message: string }>
  | Readonly<{ status: 'success'; data: BotConsoleData; message: null }>
  | Readonly<{ status: 'error'; data: null; message: string }>

function safeMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function useBotConsole() {
  const [state, setState] = useState<BotConsoleState>({
    status: 'loading',
    data: null,
    message: null
  })
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(false)

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, message: null })
    try {
      const accountSession = await getAccountSession()
      if (accountSession.selectedAccountId === null) {
        setState({
          status: 'empty',
          data: null,
          message:
            'Select and connect an authorized account before managing bots.'
        })
        return
      }
      const [configurations, sessions] = await Promise.all([
        getBotConfigurations(),
        getBotSessions()
      ])
      setState({
        status: 'success',
        data: {
          accountSession,
          selectedAccountId: accountSession.selectedAccountId,
          configurations,
          sessions
        },
        message: null
      })
    } catch (error: unknown) {
      if (
        error instanceof ApiError &&
        (error.code === 'AUTHENTICATION_REQUIRED' ||
          error.code === 'SESSION_NOT_FOUND' ||
          error.code === 'ACCOUNT_NOT_SELECTED')
      ) {
        setState({
          status: 'empty',
          data: null,
          message: 'Connect a Deriv account before opening the bot console.'
        })
        return
      }
      setState({
        status: 'error',
        data: null,
        message: safeMessage(error, 'Unable to load the bot console.')
      })
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const runAction = useCallback(
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
    async (configuration: BotConfiguration) =>
      runAction(
        () => startBotSession(configuration),
        'Unable to start this bot session.'
      ),
    [runAction]
  )

  const save = useCallback(
    async (name: string, configuration: BotConfiguration) =>
      runAction(
        () => saveBotConfiguration(name, configuration),
        'Unable to save this configuration.'
      ),
    [runAction]
  )

  const act = useCallback(
    async (sessionId: string, action: 'pause' | 'resume' | 'stop') =>
      runAction(
        () => changeBotSessionState(sessionId, action),
        'Unable to update this bot session.'
      ),
    [runAction]
  )

  const evaluate = useCallback(
    async (sessionId: string) =>
      runAction(
        () => evaluateBotSession(sessionId),
        'Unable to evaluate this session right now.'
      ),
    [runAction]
  )

  return { state, actionMessage, isWorking, load, start, save, act, evaluate }
}
