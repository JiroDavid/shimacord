import type { PresenceStatus } from '../../shared/types'
import { Mascot } from './Mascot'

type Props = {
  status: PresenceStatus
  selectedId: string | null
  valid: boolean
  onGoLive: () => void
  onStop: () => void
}

export function GoLiveBar({ status, selectedId, valid, onGoLive, onStop }: Props) {
  const { state } = status
  const active = state === 'live' || state === 'discord-missing'
  const otherLook = active && selectedId !== null && selectedId !== status.lookId
  const canGo = selectedId !== null && valid && state !== 'connecting'

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-tan/60 p-3">
      <Mascot size={52} mood={state === 'live' ? 'happy' : 'idle'} />
      <div className="min-w-0 flex-1 text-sm">
        {state === 'live' && (
          <span className="flex items-center gap-2">
            <span data-testid="live-dot" className="h-2.5 w-2.5 rounded-full bg-moss" />
            You are live
          </span>
        )}
        {state === 'discord-missing' && <span>Open Discord and we will connect</span>}
        {state === 'error' && <span className="text-shiba">{status.message}</span>}
        {state === 'connecting' && <span>Connecting to Discord...</span>}
        {state === 'idle' && <span className="text-ink/70">Pick a look and go live</span>}
      </div>
      {active && (
        <button onClick={onStop} className="rounded-full bg-ink px-5 py-2 text-sm text-paper">
          Stop
        </button>
      )}
      {(!active || otherLook) && (
        <button
          onClick={onGoLive}
          disabled={!canGo}
          className="rounded-full bg-shiba px-5 py-2 text-sm text-paper disabled:opacity-40"
        >
          {state === 'connecting' ? 'Connecting...' : 'Go live'}
        </button>
      )}
    </div>
  )
}
