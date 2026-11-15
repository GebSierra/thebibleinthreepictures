/** The three pictures and the cross, in timeline order. Fixed by Geb's framework. */
export type StageKey = 'A' | 'B' | 'C1' | 'C2'
export type PictureName = 'The World' | 'Egypt' | 'The Land' | 'The Cross'

export interface Picture {
  key: StageKey
  name: PictureName
  /** Printed label. Both C stages print as "Stage C", on purpose. */
  stageLabel: 'Stage A' | 'Stage B' | 'Stage C'
  /** The three pictures get struck through. The cross never does. */
  strikable: boolean
}

export const PICTURES: readonly Picture[] = [
  { key: 'A', name: 'The World', stageLabel: 'Stage A', strikable: true },
  { key: 'B', name: 'Egypt', stageLabel: 'Stage B', strikable: true },
  { key: 'C1', name: 'The Land', stageLabel: 'Stage C', strikable: true },
  { key: 'C2', name: 'The Cross', stageLabel: 'Stage C', strikable: false },
] as const

export const PICTURE_NAMES: readonly PictureName[] = PICTURES.map((p) => p.name)

export function pictureByName(name: string): Picture | undefined {
  return PICTURES.find((p) => p.name === name)
}

/** Drop any request to strike the cross. */
export function strikableOnly(names: readonly string[]): PictureName[] {
  return PICTURES.filter((p) => p.strikable && names.includes(p.name)).map((p) => p.name)
}
