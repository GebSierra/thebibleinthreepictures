/**
 * Temporary home for the preview build. It shows the generated Level 1 content
 * so Geb can check data on a phone. The real Home, Lesson and Review screens
 * wait for the design Geb picks (plan task T2.1).
 */
import content from './content/level1.json'
import { Timeline } from './components/Timeline.tsx'
import type { LevelContent, Slot } from './lib/types.ts'

const data = content as unknown as LevelContent

function Text({ slot, gap }: { slot: Slot | null; gap: string }) {
  if (!slot) return <span className="gap">TBD (Geb): {gap}</span>
  return (
    <>
      {slot.value}
      {slot.draft && <span className="badge">DRAFT</span>}
    </>
  )
}

export function App() {
  return (
    <main className="shell">
      <header>
        <p className="eyebrow">Level 1 · The Bible in Three Pictures</p>
        <h1>The Bible in Three Pictures</h1>
        {data.build === 'preview' && <p className="note">Preview build. Drafts are marked. Screens are not designed yet.</p>}
      </header>
      <Timeline struck={['The World', 'Egypt', 'The Land']} />
      <ol className="lessons">
        {data.lessons.map((l) => (
          <li key={l.id} className={`lesson stage-${l.stageKey}`}>
            <p className="eyebrow">{l.stageLabel}</p>
            <h2>{l.title}</h2>
            <p><b>Key event:</b> <Text slot={l.keyEvent} gap="key event" /></p>
            {l.christPoint && <p><b>See Christ:</b> <Text slot={l.christPoint} gap="" /></p>}
            {l.read && <p><b>Read:</b> {l.read.value.join('; ')}</p>}
            <p className="muted">{l.items.length} check items · prepares for {l.prepares_for.join(', ')}</p>
          </li>
        ))}
      </ol>
      <footer className="muted">
        Test-out: {data.testOut.total} points, pass at {data.testOut.pass}. Built {data.builtAt.slice(0, 10)}.
      </footer>
    </main>
  )
}
