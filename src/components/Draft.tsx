/** The DRAFT badge. Shows only in preview builds, where drafts exist at all. */
export function Draft({ on }: { on: boolean }) {
  return on ? <span className="badge">DRAFT</span> : null
}

/** Geb's slot, not written yet. Preview builds only. */
export function Gap({ what }: { what: string }) {
  return <span className="gap">TBD (Geb): {what}</span>
}
