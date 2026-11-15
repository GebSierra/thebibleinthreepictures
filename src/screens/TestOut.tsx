/** Level 1 test-out and its result (plan tasks T3.8, T3.9). From memory. No choice items. */
import { useMemo, useState } from 'react'
import { CONTENT, useApp } from '../app/app.tsx'
import { ItemView } from '../components/ItemView.tsx'
import { Timeline } from '../components/Timeline.tsx'
import type { Grade } from '../lib/grade.ts'
import { testOutOpen } from '../lib/progress.ts'
import { resultsSummary } from '../lib/share.ts'
import type { TestOutRecord } from '../lib/storage.ts'
import { recordTestOut, scoreTestOut, testOutItems } from '../lib/testout.ts'

export function ShareResults({ rec }: { rec: TestOutRecord }) {
  const { state } = useApp()
  const text = resultsSummary(rec, CONTENT.items, state.lessonsDone)
  const [note, setNote] = useState('')
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ text })
      else {
        await navigator.clipboard.writeText(text)
        setNote('Copied. Paste it into a text or email to Geb.')
      }
    } catch {
      setNote('Could not share. Copy the text below by hand.')
    }
  }
  return (
    <div className="share">
      <button type="button" className="btn btn-quiet" onClick={share}>Share my results</button>
      {note && <p className="hint" role="status">{note}</p>}
      <pre className="share-text" aria-label="Results text">{text}</pre>
    </div>
  )
}

export function TestOut() {
  const { state, update, now } = useApp()
  const items = useMemo(() => testOutItems(CONTENT), [])
  const [started, setStarted] = useState(false)
  const [i, setI] = useState(0)
  const [grades, setGrades] = useState<Record<string, Grade>>({})
  const [rec, setRec] = useState<TestOutRecord | null>(null)

  if (!testOutOpen(CONTENT, state)) {
    return (
      <main className="screen">
        <h1>Not open yet</h1>
        <p className="muted">The test-out opens after all four lessons.</p>
        <a className="btn btn-primary" href="#/learn">Back to Learn</a>
      </main>
    )
  }

  if (rec) {
    return (
      <main className="screen">
        <Timeline struck={['The World', 'Egypt', 'The Land']} />
        <p className="eyebrow gold">LEVEL 1 TEST-OUT</p>
        <h1>{rec.score} of {rec.max}</h1>
        <p className="lead">{rec.passed ? 'You passed. Level 2, The ABCs, is open.' : `Not yet. You need ${CONTENT.testOut.pass}. Keep reviewing and try again.`}</p>
        <ShareResults rec={rec} />
        <a className="btn btn-primary" href="#/learn">Back to Learn</a>
      </main>
    )
  }

  if (!started) {
    return (
      <main className="screen">
        <a href="#/me" className="icon-btn" aria-label="Leave the test-out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </a>
        <p className="eyebrow gold">LEVEL 1 TEST-OUT</p>
        <h1>Tell the whole story</h1>
        <p className="lead">{CONTENT.testOut.total} points. Pass at {CONTENT.testOut.pass}. From memory, no notes.</p>
        <ul className="plain">
          {CONTENT.testOut.parts.map((p) => <li key={p.id}>{p.task} <span className="muted">({p.points})</span></li>)}
        </ul>
        <button type="button" className="btn btn-primary" onClick={() => setStarted(true)}>Begin</button>
      </main>
    )
  }

  return (
    <main className="screen">
      <p className="eyebrow">Question {i + 1} of {items.length}</p>
      <ItemView
        item={items[i]}
        mode="test_out"
        onDone={(g) => {
          const all = { ...grades, [items[i].id]: g }
          setGrades(all)
          window.scrollTo(0, 0)
          if (i + 1 < items.length) return setI(i + 1)
          const score = scoreTestOut(CONTENT, all)
          const t = now()
          update((s) => recordTestOut(s, score, t))
          setRec({ date: t.toISOString(), score: score.score, max: score.max, passed: score.passed, results: score.results })
        }}
      />
    </main>
  )
}
