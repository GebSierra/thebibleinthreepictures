/**
 * Screens for the six item types (plan task T3.5). Grading is in src/lib/grade.ts.
 * In lessons and review the learner sees right or wrong and the answer.
 * In the test-out, app-graded items move on without saying.
 */
import { useEffect, useState } from 'react'
import {
  gradeChoice, gradeOrder, gradeSelfCheck, gradeSpeakTimed, gradeStrike, gradeTypeWord, type Grade,
} from '../lib/grade.ts'
import { PICTURE_NAMES, type PictureName } from '../lib/pictures.ts'
import type { Item } from '../lib/types.ts'
import { Draft } from './Draft.tsx'
import { PictureDisc } from './Timeline.tsx'

export type ItemMode = 'lesson' | 'review' | 'test_out'

interface Props {
  item: Item
  mode: ItemMode
  onDone: (g: Grade) => void
}

function answerText(item: Item): string {
  const v = item.answer?.value
  return Array.isArray(v) ? v.join(', ') : (v ?? '')
}

function Feedback({ g, item, onNext }: { g: Grade; item: Item; onNext: () => void }) {
  return (
    <div className={`feedback ${g.correct ? 'is-right' : 'is-wrong'}`} role="status">
      <p className="feedback-head">{g.correct ? 'Right.' : g.empty ? 'No answer given.' : 'Not quite.'}</p>
      {!g.correct && item.answer && (
        <p>
          Answer: <b>{answerText(item)}</b>
          <Draft on={item.answer.draft} />
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onNext} autoFocus>
        Continue
      </button>
    </div>
  )
}

/** Shared shell: prompt on top, the answer area, then feedback or the action. */
function useFinish(item: Item, mode: ItemMode, onDone: (g: Grade) => void) {
  const [graded, setGraded] = useState<Grade | null>(null)
  const finish = (g: Grade) => (mode === 'test_out' ? onDone(g) : setGraded(g))
  const feedback = graded ? <Feedback g={graded} item={item} onNext={() => onDone(graded)} /> : null
  return { graded, finish, feedback }
}

function Prompt({ item }: { item: Item }) {
  return (
    <h2 className="item-prompt">
      {item.prompt.value}
      <Draft on={item.prompt.draft} />
    </h2>
  )
}

/** Tap a picture, it fills the next empty place. Tap a filled place to empty it. */
export function OrderPicker({
  slots, placed, setPlaced, disabled,
}: { slots: number; placed: (PictureName | null)[]; setPlaced: (p: (PictureName | null)[]) => void; disabled?: boolean }) {
  const place = (name: PictureName) => {
    const i = placed.indexOf(null)
    if (i < 0) return
    const next = [...placed]
    next[i] = name
    setPlaced(next)
  }
  const clear = (i: number) => {
    const next = [...placed]
    next[i] = null
    setPlaced(next)
  }
  return (
    <div className="order">
      <ol className="order-slots" aria-label="Timeline places">
        {Array.from({ length: slots }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              className={`order-slot${placed[i] ? ' is-filled' : ''}`}
              onClick={() => clear(i)}
              disabled={disabled || !placed[i]}
              aria-label={placed[i] ? `Place ${i + 1}: ${placed[i]}. Tap to remove.` : `Place ${i + 1}: empty`}
            >
              {placed[i] ? <PictureDisc name={placed[i]!} size={56} /> : <span className="order-blank" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ol>
      <div className="chips">
        {PICTURE_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            className="chip"
            onClick={() => place(name)}
            disabled={disabled || placed.includes(name) || !placed.includes(null)}
          >
            <PictureDisc name={name} size={40} />
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

function OrderItem({ item, mode, onDone }: Props) {
  const n = (item.answer?.value as string[] | undefined)?.length ?? 4
  const [placed, setPlaced] = useState<(PictureName | null)[]>(Array(n).fill(null))
  const { graded, finish, feedback } = useFinish(item, mode, onDone)
  return (
    <div className="item">
      <Prompt item={item} />
      <OrderPicker slots={n} placed={placed} setPlaced={setPlaced} disabled={!!graded} />
      {feedback ?? (
        <button type="button" className="btn btn-primary" disabled={placed.includes(null)} onClick={() => finish(gradeOrder(item, placed))}>
          Check
        </button>
      )}
    </div>
  )
}

function TypeWordItem({ item, mode, onDone }: Props) {
  const [text, setText] = useState('')
  const { graded, finish, feedback } = useFinish(item, mode, onDone)
  const id = `tw-${item.id}`
  return (
    <form className="item" onSubmit={(e) => { e.preventDefault(); if (!graded) finish(gradeTypeWord(item, text)) }}>
      <Prompt item={item} />
      <label htmlFor={id} className="label">Your answer</label>
      <input id={id} className="field" value={text} onChange={(e) => setText(e.target.value)} disabled={!!graded} autoComplete="off" autoCapitalize="off" spellCheck={false} />
      {feedback ?? (
        <>
          <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Check</button>
          <button type="button" className="btn btn-quiet" onClick={() => finish(gradeTypeWord(item, ''))}>I don't know</button>
        </>
      )}
    </form>
  )
}

function StrikeItem({ item, mode, onDone }: Props) {
  const [tapped, setTapped] = useState<string[]>([])
  const { graded, finish, feedback } = useFinish(item, mode, onDone)
  const toggle = (n: string) => setTapped((t) => (t.includes(n) ? t.filter((x) => x !== n) : [...t, n]))
  return (
    <div className="item">
      <Prompt item={item} />
      <div className="strike-grid">
        {PICTURE_NAMES.map((name) => (
          <button key={name} type="button" className="strike-pick" aria-pressed={tapped.includes(name)} onClick={() => toggle(name)} disabled={!!graded}>
            <PictureDisc name={name} size={64} struck={tapped.includes(name)} />
            {name}
          </button>
        ))}
      </div>
      {feedback ?? (
        <button type="button" className="btn btn-primary" disabled={!tapped.length} onClick={() => finish(gradeStrike(item, tapped))}>Check</button>
      )}
    </div>
  )
}

function ChoiceItem({ item, mode, onDone }: Props) {
  const [picked, setPicked] = useState<string | null>(null)
  const { graded, finish, feedback } = useFinish(item, mode, onDone)
  return (
    <div className="item">
      <Prompt item={item} />
      <div className="options" role="radiogroup" aria-label="Choices">
        {(item.options ?? []).map((o) => (
          <button key={o} type="button" role="radio" aria-checked={picked === o} className="option" onClick={() => setPicked(o)} disabled={!!graded}>
            {o}
          </button>
        ))}
      </div>
      {feedback ?? (
        <button type="button" className="btn btn-primary" disabled={!picked} onClick={() => finish(gradeChoice(item, picked))}>Check</button>
      )}
    </div>
  )
}

/** Write, see the model answer, mark yourself. */
function SelfCheckItem({ item, onDone }: Props) {
  const [text, setText] = useState('')
  const [shown, setShown] = useState(false)
  const id = `sc-${item.id}`
  return (
    <div className="item">
      <Prompt item={item} />
      <label htmlFor={id} className="label">Write or say your answer, then show the model answer.</label>
      <textarea id={id} className="field" rows={3} value={text} onChange={(e) => setText(e.target.value)} disabled={shown} />
      {!shown ? (
        <button type="button" className="btn btn-primary" onClick={() => setShown(true)}>Show answer</button>
      ) : (
        <>
          <div className="model">
            <p className="model-label">MODEL ANSWER</p>
            <p>{answerText(item)}<Draft on={!!item.answer?.draft} /></p>
          </div>
          {!text.trim() ? (
            <>
              <p className="hint">You did not write an answer, so this counts as not yet.</p>
              <button type="button" className="btn btn-primary" onClick={() => onDone(gradeSelfCheck(item, '', null))}>Continue</button>
            </>
          ) : (
            <>
              <p className="hint">Did you have it?</p>
              <div className="pair">
                <button type="button" className="btn btn-quiet" onClick={() => onDone(gradeSelfCheck(item, text, false))}>Not yet</button>
                <button type="button" className="btn btn-primary" onClick={() => onDone(gradeSelfCheck(item, text, true))}>Yes, I had it</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

/** Tell it aloud against the timer, then tick what was true. */
function SpeakTimedItem({ item, onDone }: Props) {
  const total = item.seconds ?? 60
  const [left, setLeft] = useState<number | null>(null)
  const [stopped, setStopped] = useState(false)
  const [ticked, setTicked] = useState<boolean[]>((item.checks ?? []).map(() => false))
  useEffect(() => {
    if (left === null || stopped) return
    if (left <= 0) { setStopped(true); return }
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [left, stopped])
  return (
    <div className="item">
      <Prompt item={item} />
      <p className="timer" aria-live="polite">{left === null ? `${total} seconds` : `${Math.max(left, 0)} seconds left`}</p>
      {left === null && <button type="button" className="btn btn-primary" onClick={() => setLeft(total)}>Start the timer</button>}
      {left !== null && !stopped && <button type="button" className="btn btn-primary" onClick={() => setStopped(true)}>I'm done</button>}
      {stopped && (
        <fieldset className="checks">
          <legend className="label">Tick what was true. A friend can check for you.</legend>
          {(item.checks ?? []).map((c, i) => (
            <label key={c} className="check">
              <input type="checkbox" checked={ticked[i]} onChange={(e) => setTicked(ticked.map((t, j) => (j === i ? e.target.checked : t)))} />
              {c}
            </label>
          ))}
          <button type="button" className="btn btn-primary" onClick={() => onDone(gradeSpeakTimed(item, ticked))}>Done</button>
        </fieldset>
      )}
    </div>
  )
}

export function ItemView(props: Props) {
  // A fresh component per item, so no answer carries over.
  const key = `${props.mode}-${props.item.id}`
  switch (props.item.type) {
    case 'order': return <OrderItem key={key} {...props} />
    case 'type_word': return <TypeWordItem key={key} {...props} />
    case 'strike': return <StrikeItem key={key} {...props} />
    case 'choice': return <ChoiceItem key={key} {...props} />
    case 'self_check': return <SelfCheckItem key={key} {...props} />
    case 'speak_timed': return <SpeakTimedItem key={key} {...props} />
  }
}
