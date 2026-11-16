/** Review (plan task T3.7): the cards due now, one at a time. Recall only, never choice. */
import { useState } from 'react'
import { CONTENT, useApp } from '../app/app.tsx'
import { ItemView } from '../components/ItemView.tsx'
import { Timeline } from '../components/Timeline.tsx'
import { dueItems, reviewAnswer, shownPictures, struckPictures } from '../lib/progress.ts'
import type { Item } from '../lib/types.ts'

function lessonTitle(item: Item): string {
  return CONTENT.lessons.find((l) => item.sessions.includes(l.id))?.title.toUpperCase() ?? ''
}

export function Review() {
  const { state, update, now } = useApp()
  // Take the queue once, so answering a card does not reshuffle the session.
  const [queue] = useState(() => dueItems(CONTENT, state, now()))
  const [i, setI] = useState(0)

  if (!queue.length || i >= queue.length) {
    return (
      <main className="screen">
        <Timeline shown={shownPictures(CONTENT, state)} struck={struckPictures(CONTENT, state)} />
        <h1>{queue.length ? 'Review done' : 'Nothing due now'}</h1>
        <p className="muted">
          {queue.length ? `${queue.length} card${queue.length === 1 ? '' : 's'} reviewed. They come back when they are due.` : 'Finish a lesson, or come back tomorrow.'}
        </p>
        <a className="btn btn-primary" href="#/learn">Back to Learn</a>
      </main>
    )
  }
  const item = queue[i]
  return (
    <main className="screen">
      <div className="review-top">
        <a href="#/learn" className="icon-btn" aria-label="End review">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </a>
        <span className="muted strong">{i + 1} of {queue.length}</span>
      </div>
      <Timeline className="timeline-small" shown={shownPictures(CONTENT, state)} struck={struckPictures(CONTENT, state)} />
      <p className="eyebrow gold">REVIEW · {lessonTitle(item)}</p>
      <ItemView
        item={item}
        mode="review"
        onDone={(g) => {
          update((s) => reviewAnswer(s, item.id, g.correct, now()))
          setI(i + 1)
          window.scrollTo(0, 0)
        }}
      />
    </main>
  )
}
