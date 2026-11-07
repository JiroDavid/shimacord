import { useEffect, useState } from 'react'
import type { LookInput } from '../../shared/types'
import { Mascot } from './Mascot'

type Props = { look: LookInput; live: boolean }

export function Preview({ look, live }: Props) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [look.largeImageUrl])

  const headline = look.kind === 'custom' ? 'Shimacord' : (look.gameName ?? 'Pick a game')
  const showImage = look.largeImageUrl !== '' && !failed

  return (
    <div className="rounded-2xl bg-ink p-4 text-paper">
      <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-widest">
        <span>Playing</span>
        {live && (
          <span className="flex items-center gap-1 text-moss">
            <span className="h-2 w-2 rounded-full bg-moss" />
            Live
          </span>
        )}
      </div>
      <div className="flex gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
          {showImage ? (
            <img
              src={look.largeImageUrl}
              alt="Large image"
              className="h-full w-full object-cover"
              onError={() => setFailed(true)}
            />
          ) : (
            <Mascot size={64} />
          )}
        </div>
        <div className="min-w-0 text-sm leading-snug">
          <div className="font-bold">{headline}</div>
          {look.details && <div className="truncate">{look.details}</div>}
          {look.state && <div className="truncate text-paper/80">{look.state}</div>}
          {look.showTimer && <div className="text-sky">00:00 elapsed</div>}
        </div>
      </div>
    </div>
  )
}
