/**
 * The timeline: the three pictures and the cross on one line (plan task T3.2).
 * Shown on every screen. The three pictures can be struck through. The cross never is.
 *
 * The drawings are ported from Geb's 60-second film (see src/lib/art.ts):
 * the drawn globe, the pyramids, his Israel outline, and the glowing cross.
 * Colors come from CSS variables set by tokens.css.
 */
import { useId } from 'react'
import { GLOBE_LAND, ISRAEL_PATH } from '../lib/art.ts'
import { PICTURES, type PictureName } from '../lib/pictures.ts'

export interface TimelineProps {
  /** Pictures to draw. Others show as empty slots. Default: all four. */
  shown?: readonly PictureName[]
  /** Pictures to strike. Any request to strike the cross is ignored. */
  struck?: readonly PictureName[]
  /** The picture the learner is on now. */
  current?: PictureName
  className?: string
}

const W = 400
const H = 120
const SLOT = W / 4
const R = 34 // disc radius on screen
const CY = 48
const S = R / 140 // the film draws discs at radius 140
const LINE_Y = 104

export function Art({ name }: { name: PictureName }) {
  const clip = `globe-${useId().replace(/:/g, '')}`
  switch (name) {
    case 'The World':
      return (
        <g>
          <circle r="140" className="disc-fill" />
          <clipPath id={clip}>
            <circle r="88" />
          </clipPath>
          <g clipPath={`url(#${clip})`}>
            <path d={GLOBE_LAND} className="art-ink" opacity="0.85" />
          </g>
          <circle r="88" className="art-line" strokeWidth="5" />
        </g>
      )
    case 'Egypt':
      return (
        <g>
          <circle r="140" className="disc-fill" />
          <polygon points="-106,56 -18,-72 56,56" className="art-ink" opacity="0.8" />
          <polygon points="4,56 66,-20 116,56" className="art-ink" opacity="0.55" />
          <path d="M-118 58 H118" className="art-line" strokeWidth="5" strokeLinecap="round" />
        </g>
      )
    case 'The Land':
      return (
        <g>
          <circle r="140" className="disc-fill" />
          <g transform="scale(0.586) translate(-249.9 -250)">
            <path d={ISRAEL_PATH} className="art-ink" opacity="0.22" />
            <path d={ISRAEL_PATH} className="art-line" strokeWidth="8.5" strokeLinejoin="round" />
          </g>
        </g>
      )
    case 'The Cross':
      return (
        <g className="cross-glyph">
          <circle r="150" className="cross-halo" />
          <rect x="-9" y="-118" width="18" height="236" rx="3" />
          <rect x="-62" y="-62" width="124" height="18" rx="3" />
        </g>
      )
  }
}

export function Timeline({ shown, struck = [], current, className }: TimelineProps) {
  const show = new Set(shown ?? PICTURES.map((p) => p.name))
  return (
    <svg
      className={['timeline', className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${W} ${H}`}
      role="group"
      aria-label="Timeline of the Bible in three pictures and the cross"
    >
      <line className="timeline-line" x1="10" x2={W - 10} y1={LINE_Y} y2={LINE_Y} />
      {PICTURES.map((p, i) => {
        const visible = show.has(p.name)
        const isStruck = visible && p.strikable && struck.includes(p.name)
        const label = visible
          ? `${p.name}, ${p.stageLabel}${isStruck ? ', struck through' : ''}${current === p.name ? ', you are here' : ''}`
          : `${p.stageLabel}, not yet shown`
        const cx = SLOT * i + SLOT / 2
        return (
          <g
            key={p.key}
            data-picture={p.name}
            data-struck={isStruck ? 'true' : 'false'}
            className={`timeline-slot stage-${p.key}${current === p.name ? ' is-current' : ''}${visible ? '' : ' is-empty'}${isStruck ? ' is-struck' : ''}`}
            role="img"
            aria-label={label}
          >
            <circle className="timeline-node" cx={cx} cy={LINE_Y} r={current === p.name ? 6 : 4} />
            {visible ? (
              <g transform={`translate(${cx} ${CY}) scale(${S})`} className="timeline-art">
                <Art name={p.name} />
                {isStruck && <line className="timeline-strike" x1="-128" y1="-136" x2="128" y2="136" strokeWidth="14" strokeLinecap="round" />}
              </g>
            ) : (
              <circle className="timeline-blank" cx={cx} cy={CY} r={R} strokeDasharray="4 5" strokeWidth="1.5" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** One picture on its own, for buttons and cards. Decorative: label the control that holds it. */
export function PictureDisc({ name, size = 44, struck = false }: { name: PictureName; size?: number; struck?: boolean }) {
  const key = PICTURES.find((p) => p.name === name)!.key
  return (
    <svg className={`picture-disc stage-${key}`} width={size} height={size} viewBox="-150 -150 300 300" aria-hidden="true">
      <g opacity={struck ? 0.45 : 1}>
        <Art name={name} />
      </g>
      {struck && name !== 'The Cross' && <line className="timeline-strike" x1="-128" y1="-136" x2="128" y2="136" strokeWidth="14" strokeLinecap="round" />}
    </svg>
  )
}
