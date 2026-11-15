/**
 * The lesson (plan task T3.6), mirroring the book page:
 * look back, picture and key event, see Christ, read, think it through, say it in one line, check.
 */
import { useMemo, useState } from 'react'
import { CONTENT, useApp } from '../app/app.tsx'
import { Draft, Gap } from '../components/Draft.tsx'
import { ItemView, OrderPicker } from '../components/ItemView.tsx'
import { Timeline } from '../components/Timeline.tsx'
import type { Grade } from '../lib/grade.ts'
import type { PictureName } from '../lib/pictures.ts'
import { finishLesson, isLessonOpen, shownPictures } from '../lib/progress.ts'
import type { Lesson as L } from '../lib/types.ts'

type StepKey = 'rail' | 'picture' | 'christ' | 'read' | 'think' | 'oneline' | 'check' | 'done'
const LABEL: Record<StepKey, string> = {
  rail: 'LOOK BACK', picture: 'THE PICTURE', christ: 'SEE CHRIST', read: 'READ', think: 'THINK IT THROUGH',
  oneline: 'SAY IT IN ONE LINE', check: 'CHECK', done: 'DONE',
}

function stepsFor(l: L): StepKey[] {
  const s: StepKey[] = []
  if (l.recall.length) s.push('rail')
  s.push('picture')
  if (l.christPoint) s.push('christ')
  if (l.read) s.push('read')
  if (l.thinkItThrough) s.push('think')
  s.push('oneline', 'check')
  return s
}

function Rail({ lesson, onNext }: { lesson: L; onNext: () => void }) {
  const [placed, setPlaced] = useState<(PictureName | null)[]>(lesson.recall.map(() => null))
  const [checked, setChecked] = useState(false)
  const right = placed.every((p, i) => p === lesson.recall[i])
  return (
    <div className="item">
      <h2 className="item-prompt">Rebuild the timeline so far</h2>
      <p className="muted">From memory. Tap each picture you have learned, in order.</p>
      <OrderPicker slots={lesson.recall.length} placed={placed} setPlaced={setPlaced} disabled={checked} />
      {!checked ? (
        <button type="button" className="btn btn-primary" disabled={placed.includes(null)} onClick={() => setChecked(true)}>Check</button>
      ) : (
        <div className={`feedback ${right ? 'is-right' : 'is-wrong'}`} role="status">
          <p className="feedback-head">{right ? 'Right.' : 'Not quite.'}</p>
          {!right && <p>The order is: <b>{lesson.recall.join(', ')}</b></p>}
          <button type="button" className="btn btn-primary" onClick={onNext} autoFocus>Continue</button>
        </div>
      )}
    </div>
  )
}

function Think({ lesson, onNext }: { lesson: L; onNext: () => void }) {
  const qs = lesson.thinkItThrough!.value
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(false)
  const [text, setText] = useState('')
  const q = qs[i]
  const next = () => {
    if (i + 1 < qs.length) {
      setI(i + 1)
      setShown(false)
      setText('')
    } else onNext()
  }
  const id = `think-${i}`
  return (
    <div className="item" key={i}>
      <p className="eyebrow">Question {i + 1} of {qs.length}</p>
      <p className="ref">{q.ref}</p>
      <h2 className="item-prompt">{q.question}<Draft on={lesson.thinkItThrough!.draft} /></h2>
      <label htmlFor={id} className="label">Your answer</label>
      <textarea id={id} className="field" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      {!shown ? (
        <button type="button" className="btn btn-primary" onClick={() => setShown(true)}>Show answer</button>
      ) : (
        <>
          <div className="model">
            <p className="model-label">MODEL ANSWER</p>
            <p>{q.answer}<Draft on={lesson.thinkItThrough!.draft} /></p>
          </div>
          <button type="button" className="btn btn-primary" onClick={next}>{i + 1 < qs.length ? 'Next question' : 'Continue'}</button>
        </>
      )}
    </div>
  )
}

function OneLine({ lesson, onNext }: { lesson: L; onNext: () => void }) {
  const [text, setText] = useState('')
  const [shown, setShown] = useState(false)
  return (
    <div className="item">
      <h2 className="item-prompt">Say {lesson.title} in one line</h2>
      <label htmlFor="oneline" className="label">Your line</label>
      <textarea id="oneline" className="field" rows={2} value={text} onChange={(e) => setText(e.target.value)} />
      {!shown ? (
        <button type="button" className="btn btn-primary" disabled={!text.trim()} onClick={() => setShown(true)}>Show Geb's line</button>
      ) : (
        <>
          <div className="model">
            <p className="model-label">GEB'S LINE</p>
            <p>{lesson.oneLine ? <>{lesson.oneLine.value}<Draft on={lesson.oneLine.draft} /></> : <Gap what="one-line summary" />}</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={onNext}>Continue</button>
        </>
      )}
    </div>
  )
}

function Check({ lesson, onDone }: { lesson: L; onDone: (g: Record<string, Grade>) => void }) {
  const items = useMemo(() => lesson.items.map((id) => CONTENT.items.find((i) => i.id === id)!).filter(Boolean), [lesson])
  const [i, setI] = useState(0)
  const [grades, setGrades] = useState<Record<string, Grade>>({})
  return (
    <>
      <p className="eyebrow">{i + 1} of {items.length}</p>
      <ItemView
        item={items[i]}
        mode="lesson"
        onDone={(g) => {
          const all = { ...grades, [items[i].id]: g }
          setGrades(all)
          if (i + 1 < items.length) setI(i + 1)
          else onDone(all)
        }}
      />
    </>
  )
}

export function Lesson({ id }: { id: string }) {
  const { state, update, go, now } = useApp()
  const lesson = CONTENT.lessons.find((l) => l.id === id)
  const steps = useMemo(() => (lesson ? stepsFor(lesson) : []), [lesson])
  const [at, setAt] = useState(0)
  const [done, setDone] = useState(false)

  if (!lesson || !isLessonOpen(CONTENT, state, lesson.id)) {
    return (
      <main className="screen">
        <h1>Not open yet</h1>
        <p className="muted">Lessons open in order.</p>
        <a className="btn btn-primary" href="#/learn">Back to Learn</a>
      </main>
    )
  }
  const step: StepKey = done ? 'done' : steps[at]
  const next = () => {
    setAt(at + 1)
    window.scrollTo(0, 0)
  }

  return (
    <main className="screen lesson">
      <div className="lesson-top">
        <a href="#/learn" className="icon-btn" aria-label="Close lesson">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </a>
        <div className="segments" role="progressbar" aria-label="Lesson progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={Math.min(at + 1, steps.length)}>
          {steps.map((s, i) => <span key={s} className={i < at || done ? 'is-done' : i === at ? 'is-now' : ''} />)}
        </div>
      </div>
      <p className="eyebrow">{lesson.title.toUpperCase()} · {LABEL[step]}</p>

      {step === 'rail' && <Rail lesson={lesson} onNext={next} />}

      {step === 'picture' && (
        <div className="item">
          <Timeline shown={shownPictures(CONTENT, state, lesson.picture)} current={lesson.picture} />
          <p className="eyebrow">{lesson.stageLabel}</p>
          <h1>{lesson.title}</h1>
          <div className="card">
            <p className="model-label">THE KEY EVENT</p>
            <p className="lead">{lesson.keyEvent ? <>{lesson.keyEvent.value}<Draft on={lesson.keyEvent.draft} /></> : <Gap what="key event" />}</p>
          </div>
          <p>{lesson.teachingNote ? <>{lesson.teachingNote.value}<Draft on={lesson.teachingNote.draft} /></> : <Gap what="teaching note" />}</p>
          <button type="button" className="btn btn-primary" onClick={next}>Continue</button>
        </div>
      )}

      {step === 'christ' && (
        <div className="item">
          <h2 className="item-prompt">See Christ</h2>
          <div className="card christ">
            <p className="lead">{lesson.christPoint!.value}<Draft on={lesson.christPoint!.draft} /></p>
          </div>
          <button type="button" className="btn btn-primary" onClick={next}>Continue</button>
        </div>
      )}

      {step === 'read' && (
        <div className="item">
          <h2 className="item-prompt">Read</h2>
          <p className="muted">Read these in your Bible. Tick each one as you finish.</p>
          <fieldset className="checks">
            <legend className="sr-only">Passages</legend>
            {lesson.read!.value.map((r) => (
              <label key={r} className="check"><input type="checkbox" />{r}</label>
            ))}
          </fieldset>
          <Draft on={lesson.read!.draft} />
          <button type="button" className="btn btn-primary" onClick={next}>Continue</button>
        </div>
      )}

      {step === 'think' && <Think lesson={lesson} onNext={next} />}
      {step === 'oneline' && <OneLine lesson={lesson} onNext={next} />}
      {step === 'check' && (
        <Check
          lesson={lesson}
          onDone={(grades) => {
            update((s) => finishLesson(CONTENT, s, lesson.id, grades, now()))
            setDone(true)
            window.scrollTo(0, 0)
          }}
        />
      )}

      {step === 'done' && (
        <div className="item">
          <Timeline
            shown={shownPictures(CONTENT, state, lesson.picture)}
            struck={lesson.picture === 'The Cross' ? ['The World', 'Egypt', 'The Land'] : []}
          />
          <h1>Lesson done</h1>
          <p className="muted">
            {lesson.picture === 'The Cross'
              ? 'The three pictures fall. The cross stands. The Level 1 test-out is open.'
              : 'Its questions now join your review. A few come back each day.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => go({ name: 'learn' })}>Back to Learn</button>
        </div>
      )}
    </main>
  )
}
