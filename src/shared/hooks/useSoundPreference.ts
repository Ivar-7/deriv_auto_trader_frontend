import { useEffect, useState } from 'react'

const storageKey = 'deriv-auto-trader-sound'

function initialSoundPreference(): boolean {
  return window.localStorage.getItem(storageKey) !== 'muted'
}

export function useSoundPreference() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(initialSoundPreference)

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      isSoundEnabled ? 'enabled' : 'muted'
    )
  }, [isSoundEnabled])

  return { isSoundEnabled, setIsSoundEnabled }
}
