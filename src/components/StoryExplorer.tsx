/**
 * The whole story, on Me (Geb, 2026-11-17): the three pictures and the cross,
 * every word, and the dates. Explore it, or test yourself on the names.
 * It never opens a lesson. Each word shows what its lesson holds, locked, so the
 * outline makes the learner want the lessons, not feel done without them.
 */
import { useState } from 'react'
import type { StoryStage } from '../lib/types.ts'
import { PictureDisc } from './Timeline.tsx'

interface Props {
  story: StoryStage[]
  /** Strike the three pictures (after the cross lesson). Never the cross. */
  struck: boolean
  level2Open: boolean
}

function Lock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

/** A label that hides in test mode until tapped. */
function Hidden({ id, text, test, shown, reveal, className }: {
  id: string; text: string; test: boolean; shown: Set<string>; reveal: (id: string) => void; className?: string
}) {
  if (!test || shown.has(id)) return <span className={className}>{text}</span>
  return (
    <button type="button" className={`reveal ${className ?? ''}`} onClick={() => reveal(id)} aria-label={`Hidden. Say it, then tap to check.`}>
      <span aria-hidden="true">?</span>
    </button>
  )
}

function Teaser({ word, level2Open }: { word: string; level2Open: boolean }) {
  return (
    <div className="story-teaser" role="region" aria-label={`What the lesson on ${word} holds`}>
      <p className="model-label"><Lock /> IN THE LESSON ON {word.toUpperCase()}</p>
      <ul>
        <li>What happened, and why it matters</li>
        <li>Where Christ shows up</li>
        <li>The passages to read</li>
        <li>Questions to think through</li>
      </ul>
      <p className="muted small">{level2Open ? 'Level 2, The ABCs, is open to you. Coming soon.' : 'Part of Level 2, The ABCs. It opens when you pass the Level 1 test-out.'}</p>
    </div>
  )
}

/** Explore: the whole line left to right, as in the film. Swipe to see it all. */
function StoryLine({ story, struck, open, setOpen }: {
  story: StoryStage[]; struck: boolean; open: string | null; setOpen: (w: string | null) => void
}) {
  return (
    <div className="line-scroll" role="region" aria-label="The whole story, left to right. Swipe to see it all.">
      <ol className="line-stages">
        {story.map((st) => (
          <li key={st.key} className={`line-stage stage-${st.key}`}>
            <div className="line-stage-head">
              <PictureDisc name={st.picture} size={56} struck={struck && st.picture !== 'The Cross'} />
              <div>
                <p className="eyebrow">{st.label}</p>
                <span className="line-picture">{st.picture}</span>
              </div>
            </div>
            <ol className="line-words">
              {st.words.map((w) => {
                const isOpen = open === w.word
                return (
                  <li key={w.word} className="line-word">
                    <span className="line-dot" aria-hidden="true" />
                    <button type="button" className="story-word-name line-word-name" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : w.word)}>
                      {w.word}
                    </button>
                    {w.date && <span className="story-date">{w.date}</span>}
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function StoryExplorer({ story, struck, level2Open }: Props) {
  const [test, setTest] = useState(false)
  const [shown, setShown] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<string | null>(null)
  const reveal = (id: string) => setShown((s) => new Set(s).add(id))
  const total = story.length + story.reduce((a, s) => a + s.words.length + s.words.filter((w) => w.date).length, 0)

  return (
    <section className="story" aria-labelledby="story-h">
      <div className="story-head">
        <h2 id="story-h">The whole story</h2>
        <p className="muted">Three pictures, the cross, every word and the dates. This is the outline. The lessons fill it in.</p>
      </div>

      <div className="seg" role="group" aria-label="Mode">
        <button type="button" aria-pressed={!test} onClick={() => setTest(false)}>Explore</button>
        <button type="button" aria-pressed={test} onClick={() => { setTest(true); setShown(new Set()); setOpen(null) }}>Test yourself</button>
      </div>
      {test && (
        <p className="hint" role="status">
          Say each name out loud, then tap to check. {shown.size} of {total} checked.
          {shown.size > 0 && <> <button type="button" className="link-btn" onClick={() => setShown(new Set())}>Hide all again</button></>}
        </p>
      )}

      {!test && (
        <>
          <StoryLine story={story} struck={struck} open={open} setOpen={setOpen} />
          {open ? <Teaser word={open} level2Open={level2Open} /> : <p className="hint">Swipe along the line. Tap a word to see what its lesson holds.</p>}
        </>
      )}

      {test && <ol className="story-stages">
        {story.map((st) => (
          <li key={st.key} className={`story-stage stage-${st.key}`}>
            <div className="story-stage-head">
              <PictureDisc name={st.picture} size={52} struck={struck && st.picture !== 'The Cross'} />
              <div>
                <p className="eyebrow">{st.label}</p>
                <Hidden id={`p-${st.key}`} text={st.picture} test shown={shown} reveal={reveal} className="story-picture" />
              </div>
            </div>
            <ol className="story-words">
              {st.words.map((w) => {
                const id = `w-${w.word}`
                return (
                  <li key={w.word} className="story-word">
                    <span className="story-dot" aria-hidden="true" />
                    <div className="story-word-body">
                      <div className="story-word-row">
                        <Hidden id={id} text={w.word} test shown={shown} reveal={reveal} className="story-word-name" />
                        {w.date && <Hidden id={`d-${w.word}`} text={w.date} test shown={shown} reveal={reveal} className="story-date" />}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ol>}

      <p className="story-foot">
        You can say the outline. The lessons show you why the three pictures fall, and why the cross stands.
      </p>
    </section>
  )
}
