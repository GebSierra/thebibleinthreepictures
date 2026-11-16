/** App-wide state and routes. Routes live in the URL hash so the back button works and nothing needs a server. */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import content from '../content/level1.json'
import { loadState, saveState, type AppState } from '../lib/storage.ts'
import type { LevelContent } from '../lib/types.ts'

export const CONTENT = content as unknown as LevelContent

export type Route =
  | { name: 'learn' }
  | { name: 'review' }
  | { name: 'me' }
  | { name: 'lesson'; id: string }
  | { name: 'test-out' }

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/')
  switch (parts[0]) {
    case 'review': return { name: 'review' }
    case 'me': return { name: 'me' }
    case 'test-out': return { name: 'test-out' }
    case 'lesson': return parts[1] ? { name: 'lesson', id: parts[1] } : { name: 'learn' }
    default: return { name: 'learn' }
  }
}

export function href(r: Route): string {
  return r.name === 'lesson' ? `#/lesson/${r.id}` : `#/${r.name}`
}

interface Ctx {
  state: AppState
  update: (f: (s: AppState) => AppState) => void
  route: Route
  go: (r: Route) => void
  /** The clock. One place, so tests can move it. */
  now: () => Date
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())
  const [route, setRoute] = useState<Route>(() => parseRoute(location.hash))
  useEffect(() => {
    const on = () => {
      setRoute(parseRoute(location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const update = useCallback((f: (s: AppState) => AppState) => {
    setState((s) => {
      const next = f(s)
      saveState(next)
      return next
    })
  }, [])
  const go = useCallback((r: Route) => {
    location.hash = href(r)
  }, [])
  return <AppCtx.Provider value={{ state, update, route, go, now: () => new Date() }}>{children}</AppCtx.Provider>
}

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp outside AppProvider')
  return c
}
