import { useEffect, useState } from 'react'

const storageKey = 'deriv-auto-trader-appearance'

function getInitialAppearance(): boolean {
  const storedAppearance = window.localStorage.getItem(storageKey)

  if (storedAppearance === 'dark') {
    return true
  }

  if (storedAppearance === 'light') {
    return false
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useAppearance() {
  const [isDark, setIsDark] = useState(getInitialAppearance)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem(storageKey, isDark ? 'dark' : 'light')
  }, [isDark])

  return { isDark, setIsDark }
}
