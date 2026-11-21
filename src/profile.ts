import { useCallback, useState } from 'react'
import { PROFILE_KEY } from './storageKeys'

interface Profile {
  name: string
}

function loadProfile(): Profile | null {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed.name === 'string' ? (parsed as Profile) : null
  } catch {
    return null
  }
}

function saveProfile(profile: Profile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // Storage may be unavailable (e.g. private browsing quota). The name just
    // won't survive a refresh in that case.
  }
}

/** The local profile name shown on "[Name]'s schedule · Today". Null until set up. */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())

  const setName = useCallback((name: string) => {
    const next = { name: name.trim() }
    saveProfile(next)
    setProfile(next)
  }, [])

  return { name: profile?.name ?? null, setName }
}
