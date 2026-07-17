import { z } from 'zod'

const publicEnvironmentSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_DERIV_APP_ID: z
    .string()
    .trim()
    .min(1)
    .refine((value) => value !== 'YOUR_DERIV_APP_ID')
})

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>

export type PublicEnvironmentState =
  | Readonly<{ isValid: true; value: PublicEnvironment }>
  | Readonly<{ isValid: false }>

export function readPublicEnvironment(): PublicEnvironmentState {
  const parsed = publicEnvironmentSchema.safeParse({
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_DERIV_APP_ID: import.meta.env.VITE_DERIV_APP_ID
  })

  if (!parsed.success) {
    return { isValid: false }
  }

  return { isValid: true, value: parsed.data }
}
