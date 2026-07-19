import { readPublicEnvironment } from '../config/env'

type ApiFailure = Readonly<{
  error: Readonly<{
    code: string
    message: string
    requestId: string
  }>
}>

const readRequestTimeoutMilliseconds = 8_000

export class ApiError extends Error {
  public readonly code: string

  public constructor(code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export async function apiRequest<TData>(
  path: string,
  parseData: (data: unknown) => TData | null,
  options: Readonly<RequestInit> = {}
): Promise<TData> {
  const environment = readPublicEnvironment()

  if (!environment.isValid) {
    throw new ApiError(
      'CONFIGURATION_REQUIRED',
      'The application API URL is not configured.'
    )
  }

  let response: Response

  try {
    response = await requestWithRecovery(
      new URL(path, environment.value.VITE_API_URL).toString(),
      {
        ...options,
        credentials: 'include',
        headers: {
          ...(options.body === undefined
            ? {}
            : { 'content-type': 'application/json' }),
          ...options.headers
        }
      }
    )
  } catch {
    throw new ApiError(
      'API_UNAVAILABLE',
      'The application service is unavailable. Try again shortly.'
    )
  }

  const payload = await readJson(response)

  if (!response.ok) {
    const failure = asApiFailure(payload)
    throw new ApiError(
      failure?.error.code ?? 'REQUEST_FAILED',
      failure?.error.message ?? 'The request could not be completed.'
    )
  }

  const data = asApiData(payload)

  const parsedData = data === null ? null : parseData(data)

  if (parsedData === null) {
    throw new ApiError(
      'INVALID_RESPONSE',
      'The application service returned an invalid response.'
    )
  }

  return parsedData
}

export async function apiTextRequest(
  path: string,
  options: Readonly<RequestInit> = {}
): Promise<string> {
  const environment = readPublicEnvironment()

  if (!environment.isValid) {
    throw new ApiError(
      'CONFIGURATION_REQUIRED',
      'The application API URL is not configured.'
    )
  }

  let response: Response

  try {
    response = await requestWithRecovery(
      new URL(path, environment.value.VITE_API_URL).toString(),
      {
        ...options,
        credentials: 'include',
        headers: { ...options.headers }
      }
    )
  } catch {
    throw new ApiError(
      'API_UNAVAILABLE',
      'The application service is unavailable. Try again shortly.'
    )
  }

  if (!response.ok) {
    const failure = asApiFailure(await readJson(response))
    throw new ApiError(
      failure?.error.code ?? 'REQUEST_FAILED',
      failure?.error.message ?? 'The request could not be completed.'
    )
  }

  return response.text()
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function requestWithRecovery(
  url: string,
  options: Readonly<RequestInit>
): Promise<Response> {
  const isReadRequest = (options.method ?? 'GET').toUpperCase() === 'GET'
  const attempts = isReadRequest ? 2 : 1

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller =
      isReadRequest && options.signal === undefined
        ? new AbortController()
        : null
    const timeout =
      controller === null
        ? null
        : globalThis.setTimeout(
            () => controller.abort(),
            readRequestTimeoutMilliseconds
          )

    try {
      const response = await fetch(
        url,
        controller === null
          ? options
          : { ...options, signal: controller.signal }
      )

      if (
        attempt === attempts - 1 ||
        ![502, 503, 504, 522].includes(response.status)
      ) {
        return response
      }
    } catch (error) {
      if (attempt === attempts - 1) {
        throw error
      }
    } finally {
      if (timeout !== null) {
        globalThis.clearTimeout(timeout)
      }
    }

    await new Promise<void>((resolve) => {
      globalThis.setTimeout(resolve, 700)
    })
  }

  throw new Error('Unreachable request recovery state.')
}

function asApiFailure(payload: unknown): ApiFailure | null {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('error' in payload)
  ) {
    return null
  }

  const error = payload.error

  if (
    typeof error !== 'object' ||
    error === null ||
    !('code' in error) ||
    !('message' in error) ||
    typeof error.code !== 'string' ||
    typeof error.message !== 'string'
  ) {
    return null
  }

  const requestId =
    'requestId' in error && typeof error.requestId === 'string'
      ? error.requestId
      : ''

  return {
    error: {
      code: error.code,
      message: error.message,
      requestId
    }
  }
}

function asApiData(payload: unknown): unknown | null {
  if (typeof payload !== 'object' || payload === null || !('data' in payload)) {
    return null
  }

  return payload.data
}
