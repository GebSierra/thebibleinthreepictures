/** Bottom bar: Learn, Review, Me (Geb's pick, 2026-11-15). */
import { href, useApp, type Route } from '../app/app.tsx'

const TABS: { route: Route; label: string; icon: string }[] = [
  { route: { name: 'learn' }, label: 'Learn', icon: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { route: { name: 'review' }, label: 'Review', icon: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5' },
  { route: { name: 'me' }, label: 'Me', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' },
]

export function TabBar({ due }: { due: number }) {
  const { route } = useApp()
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => {
        const on = t.route.name === route.name
        return (
          <a key={t.label} href={href(t.route)} className={`tab${on ? ' is-on' : ''}`} aria-current={on ? 'page' : undefined}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={t.icon} />
            </svg>
            <span>
              {t.label}
              {t.label === 'Review' && due > 0 && <span className="tab-count" aria-label={`${due} due`}>{due}</span>}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
