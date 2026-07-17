import { readPublicEnvironment } from '../config/env'

type ApiFailure = Readonly<{
  error: Readonly<{
    code: string
    message: string
    requestId: string
  }>
}>

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
    response = await fetch(
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

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
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
