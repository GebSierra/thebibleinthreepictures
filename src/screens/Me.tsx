/** Me: levels, the test-out, past results, Share my results, and About. */
import { CONTENT, useApp } from '../app/app.tsx'
import { Gap } from '../components/Draft.tsx'
import { lessonsDoneCount, testOutOpen } from '../lib/progress.ts'
import { ShareResults } from './TestOut.tsx'

export function Me() {
  const { state } = useApp()
  const done = lessonsDoneCount(CONTENT, state)
  const open = testOutOpen(CONTENT, state)
  const last = state.testOuts.at(-1)
  return (
    <main className="screen">
      <h1>Me</h1>
      <section className="card" aria-labelledby="lvl-h">
        <p id="lvl-h" className="eyebrow">LEVEL 1 · THE BIBLE IN THREE PICTURES</p>
        <p className="lead">{done} of {CONTENT.lessons.length} lessons done</p>
        {open ? (
          <a className="btn btn-primary" href="#/test-out">{state.testOuts.length ? 'Take the test-out again' : 'Take the test-out'}</a>
        ) : (
          <p className="muted">The test-out opens after all four lessons.</p>
        )}
      </section>

      {last && (
        <section className="card" aria-labelledby="res-h">
          <p id="res-h" className="eyebrow">LAST TEST-OUT · {last.date.slice(0, 10)}</p>
          <p className="lead">{last.score} of {last.max} · {last.passed ? 'Passed' : 'Not yet'}</p>
          <ShareResults rec={last} />
        </section>
      )}

      <section className="card" aria-labelledby="lvl2-h">
        <p id="lvl2-h" className="eyebrow">LEVEL 2 · THE ABCS</p>
        <p className="muted">{state.level2Unlocked ? 'Unlocked. Coming soon.' : 'Pass the Level 1 test-out to open.'}</p>
      </section>

      <section className="about" aria-labelledby="about-h">
        <h2 id="about-h">About</h2>
        <p>The Bible in Three Pictures is a course by Geb Sierra.</p>
        <p><Gap what="credit line to Jason DeRouchie" /></p>
        <p><Gap what="privacy note. Progress stays on this phone. Nothing is sent anywhere." /></p>
        <p className="small"><Gap what="Crossway's full ESV copyright notice, copied word for word from crossway.org/permissions" /></p>
        <p className="small muted">{CONTENT.build === 'preview' ? 'Preview build: drafts are marked DRAFT.' : ''} Built {CONTENT.builtAt.slice(0, 10)}.</p>
      </section>
    </main>
  )
}
