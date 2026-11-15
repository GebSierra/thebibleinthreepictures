/** Learn (Home A, "The Line"): the timeline, one Today card, one Start button, then levels. */
import { CONTENT, useApp, type Route } from '../app/app.tsx'
import { Timeline } from '../components/Timeline.tsx'
import { dueItems, lessonsDoneCount, nextLesson, shownPictures, struckPictures, testOutOpen } from '../lib/progress.ts'

function Step({ n, title, sub, on }: { n: number; title: string; sub: string; on: boolean }) {
  return (
    <li className={`step${on ? ' is-on' : ''}`}>
      <span className="step-n" aria-hidden="true">{n}</span>
      <span>
        <span className="step-title">{title}</span>
        <span className="step-sub">{sub}</span>
      </span>
    </li>
  )
}

const WORDS = ['No pictures', 'One picture', 'Two pictures', 'Three pictures', 'All four']

export function Learn() {
  const { state, go, now } = useApp()
  const c = CONTENT
  const due = dueItems(c, state, now())
  const next = nextLesson(c, state)
  const done = lessonsDoneCount(c, state)
  const open = testOutOpen(c, state)
  const passed = state.level2Unlocked

  const steps: { title: string; sub: string; route: Route }[] = []
  if (due.length) steps.push({ title: 'Review', sub: `${due.length} card${due.length === 1 ? '' : 's'} ready`, route: { name: 'review' } })
  if (next) steps.push({ title: `Lesson: ${next.title}`, sub: `${next.stageLabel}${next.read ? ` · ${next.read.value.join('; ')}` : ''}`, route: { name: 'lesson', id: next.id } })
  else if (open && !passed) steps.push({ title: 'Level 1 test-out', sub: `${c.testOut.total} points, pass at ${c.testOut.pass}. From memory.`, route: { name: 'test-out' } })

  const left = c.lessons.length - done
  const lead = done === 0 ? 'Four lessons. One story.' : left === 0 ? (passed ? 'Level 1 passed.' : 'All four learned. Ready for the test-out.') : `${WORDS[done]} learned. ${left === 1 ? 'One' : WORDS[left].split(' ')[0]} to go.`

  return (
    <main className="screen">
      <header className="hello">
        <h1>{done === 0 ? 'Welcome' : 'Welcome back'}</h1>
        <p className="muted">{lead}</p>
      </header>
      <Timeline shown={shownPictures(c, state, next?.picture)} struck={struckPictures(c, state)} current={next?.picture} />
      <section className="card today" aria-labelledby="today-h">
        <p id="today-h" className="eyebrow gold">TODAY</p>
        {steps.length ? (
          <>
            <ol className="steps">
              {steps.map((s, i) => <Step key={s.title} n={i + 1} title={s.title} sub={s.sub} on={i === 0} />)}
            </ol>
            <button type="button" className="btn btn-primary" onClick={() => go(steps[0].route)}>Start</button>
          </>
        ) : (
          <p className="muted">Nothing due now. Come back tomorrow for review.</p>
        )}
      </section>
      <section className="levels" aria-labelledby="levels-h">
        <p id="levels-h" className="eyebrow">YOUR LEVELS</p>
        <div className="level-row">
          <span><b>Level 1</b> · The Bible in Three Pictures</span>
          <span className="gold strong">{passed ? 'Passed' : `${done} of ${c.lessons.length}`}</span>
        </div>
        <div className="bar" role="progressbar" aria-label="Level 1 lessons done" aria-valuemin={0} aria-valuemax={c.lessons.length} aria-valuenow={done}>
          <div style={{ width: `${(done / c.lessons.length) * 100}%` }} />
        </div>
        <div className="level-row muted">
          <span><b>Level 2</b> · The ABCs</span>
          <span>{passed ? 'Coming soon' : 'Pass the test-out to open'}</span>
        </div>
      </section>
    </main>
  )
}
