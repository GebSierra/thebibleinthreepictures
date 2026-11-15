/**
 * The timeline: the three pictures and the cross on one line (plan task T3.2).
 * Shown on every screen. The three pictures can be struck through. The cross never is.
 *
 * Glyphs are simple stand-ins. The October prototype's drawings (drawn globe,
 * Geb's Israel outline from assets/israel-path.txt) replace them when that
 * folder can be read. Colors come from CSS variables, set by tokens.css.
 */
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

const W = 360
const H = 96
const SLOT = W / 4

function Glyph({ name }: { name: PictureName }) {
  switch (name) {
    case 'The World':
      return (
        <g>
          <circle r="18" fill="none" strokeWidth="3" />
          <ellipse rx="8" ry="18" fill="none" strokeWidth="2" />
          <path d="M-18 0H18M-15 -9H15M-15 9H15" strokeWidth="2" />
        </g>
      )
    case 'Egypt':
      return <path d="M-20 16L0 -18L20 16Z" fill="none" strokeWidth="3" strokeLinejoin="round" />
    case 'The Land':
      return <path d="M-6 -18C2 -12 4 -4 2 4C0 10 6 14 4 18L-4 18C-6 10 -10 4 -8 -4C-7 -10 -10 -14 -6 -18Z" fill="none" strokeWidth="3" strokeLinejoin="round" />
    case 'The Cross':
      return <path d="M0 -20V20M-12 -8H12" strokeWidth="4" strokeLinecap="round" />
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
      <line className="timeline-line" x1="8" x2={W - 8} y1={H - 14} y2={H - 14} strokeWidth="2" />
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
            className={`timeline-slot stage-${p.key}${current === p.name ? ' is-current' : ''}${visible ? '' : ' is-empty'}`}
            role="img"
            aria-label={label}
          >
            <rect className="timeline-bar" x={SLOT * i + 6} y={H - 18} width={SLOT - 12} height="8" rx="4" />
            {visible ? (
              <g transform={`translate(${cx} ${H / 2 - 10})`} className="timeline-glyph" stroke="currentColor">
                <Glyph name={p.name} />
              </g>
            ) : (
              <circle className="timeline-blank" cx={cx} cy={H / 2 - 10} r="18" fill="none" strokeDasharray="4 4" strokeWidth="2" />
            )}
            {isStruck && (
              <line className="timeline-strike" x1={cx - 26} y1={H / 2 + 10} x2={cx + 26} y2={H / 2 - 30} strokeWidth="4" strokeLinecap="round" />
            )}
          </g>
        )
      })}
    </svg>
  )
}
