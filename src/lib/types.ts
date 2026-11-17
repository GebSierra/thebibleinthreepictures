/** Shapes of the generated content (src/content/level1.json). Built by scripts/content-lib.ts. */
import type { PictureName, StageKey } from './pictures.ts'

/** A piece of text with its review state. draft is true only in preview builds. */
export interface Slot<T = string> {
  value: T
  draft: boolean
}

export interface Question {
  ref: string
  question: string
  answer: string
  kind: string
}

export interface Lesson {
  id: string
  picture: PictureName
  stageKey: StageKey
  stageLabel: string
  title: string
  /** Pictures the learner rebuilds from memory at the start (the rail). */
  recall: PictureName[]
  keyEvent: Slot | null
  christPoint: Slot | null
  read: Slot<string[]> | null
  thinkItThrough: Slot<Question[]> | null
  /** Geb's model one-line summary, shown after the learner writes theirs. */
  oneLine: Slot | null
  teachingNote: Slot | null
  /** Ids of check items for this lesson, in order. */
  items: string[]
  prepares_for: string[]
}

export type ItemType = 'order' | 'type_word' | 'strike' | 'self_check' | 'speak_timed' | 'choice'
export type ItemUse = 'lesson' | 'review' | 'test_out'

export interface Item {
  id: string
  type: ItemType
  sessions: string[]
  testOut: string
  use: ItemUse[]
  points: number | null
  prompt: Slot
  answer: Slot<string | string[]> | null
  accept: string[] | null
  options: string[] | null
  seconds: number | null
  checks: string[] | null
}

export interface TestOutPart {
  id: string
  task: string
  points: number
}

/** The whole framework, for the explorer on Me. Words and dates only: no lesson content. */
export interface StoryStage {
  key: StageKey
  picture: PictureName
  label: string
  words: { word: string; date: string | null }[]
}

export interface LevelContent {
  level: 1
  build: 'preview' | 'production'
  builtAt: string
  lessons: Lesson[]
  items: Item[]
  testOut: { parts: TestOutPart[]; total: number; pass: number }
  story: StoryStage[]
}
