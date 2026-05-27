import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ZodFlatError = { formErrors?: string[]; fieldErrors?: Record<string, string[] | undefined> }

export function formatApiError(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) return fallback
  if (typeof error === 'string') return error || fallback
  const e = error as ZodFlatError
  if (e.formErrors?.length) return e.formErrors[0]
  if (e.fieldErrors) {
    const msgs = Object.values(e.fieldErrors).flat().filter(Boolean) as string[]
    if (msgs.length) return msgs[0]
  }
  return fallback
}
