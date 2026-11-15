import { AppProvider, CONTENT, useApp } from './app/app.tsx'
import { TabBar } from './components/TabBar.tsx'
import { dueItems } from './lib/progress.ts'
import { Learn } from './screens/Learn.tsx'
import { Lesson } from './screens/Lesson.tsx'
import { Me } from './screens/Me.tsx'
import { Review } from './screens/Review.tsx'
import { TestOut } from './screens/TestOut.tsx'

function Shell() {
  const { route, state, now } = useApp()
  const focus = route.name === 'lesson' || route.name === 'test-out'
  return (
    <div className={`app${focus ? ' is-focus' : ''}`}>
      {!focus && (
        <div className="topbar">
          <span className="wordmark">THE BIBLE IN THREE PICTURES</span>
          <span className="pill">{CONTENT.build === 'preview' ? 'PREVIEW' : 'LEVEL 1'}</span>
        </div>
      )}
      {route.name === 'learn' && <Learn />}
      {route.name === 'review' && <Review key={location.hash} />}
      {route.name === 'me' && <Me />}
      {route.name === 'lesson' && <Lesson key={route.id} id={route.id} />}
      {route.name === 'test-out' && <TestOut />}
      {!focus && <TabBar due={dueItems(CONTENT, state, now()).length} />}
    </div>
  )
}

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
