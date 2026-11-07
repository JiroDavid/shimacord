import type { GameEntry, LookInput } from '../../shared/types'
import { validateLook } from '../../shared/validate'
import { GamePicker } from './GamePicker'

type Props = {
  value: LookInput
  onChange: (v: LookInput) => void
  onSave: () => void
}

const field = 'w-full rounded-lg border border-tan bg-paper px-3 py-2 text-sm'
const label = 'mb-1 block text-[11px] uppercase tracking-widest'

export function Editor({ value, onChange, onSave }: Props) {
  const errors = validateLook(value)
  const set = <K extends keyof LookInput>(key: K, v: LookInput[K]) => onChange({ ...value, [key]: v })
  const pick = (g: GameEntry) => onChange({ ...value, appId: g.appId, gameName: g.name })

  const kindButton = (kind: 'game' | 'custom', text: string) => (
    <button
      onClick={() => onChange({ ...value, kind })}
      aria-pressed={value.kind === kind}
      className={`rounded-full px-4 py-1 text-sm ${value.kind === kind ? 'bg-shiba text-paper' : 'bg-tan/60'}`}
    >
      {text}
    </button>
  )

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label htmlFor="name" className={label}>Name</label>
        <input id="name" className={field} value={value.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div className="flex gap-2">
        {kindButton('game', 'Game')}
        {kindButton('custom', 'Custom')}
      </div>
      {value.kind === 'game' ? (
        <div>
          <GamePicker onPick={pick} />
          {value.gameName && <p className="mt-1 text-sm">Showing as <b>{value.gameName}</b></p>}
        </div>
      ) : (
        <p className="text-xs text-ink/70">Shown as "Shimacord" - your message goes in the lines below.</p>
      )}
      <div>
        <label htmlFor="details" className={label}>Details</label>
        <input id="details" className={field} value={value.details} onChange={(e) => set('details', e.target.value)} />
      </div>
      <div>
        <label htmlFor="state" className={label}>State</label>
        <input id="state" className={field} value={value.state} onChange={(e) => set('state', e.target.value)} />
      </div>
      <div>
        <label htmlFor="large" className={label}>Large image URL</label>
        <input id="large" className={field} value={value.largeImageUrl} onChange={(e) => set('largeImageUrl', e.target.value)} />
      </div>
      <div>
        <label htmlFor="small" className={label}>Small image URL</label>
        <input id="small" className={field} value={value.smallImageUrl} onChange={(e) => set('smallImageUrl', e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value.showTimer} onChange={(e) => set('showTimer', e.target.checked)} />
        Show elapsed timer
      </label>
      {errors.length > 0 && (
        <ul className="text-xs text-shiba">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
      <button
        onClick={onSave}
        disabled={errors.length > 0}
        className="self-start rounded-full bg-ink px-5 py-1.5 text-sm text-paper disabled:opacity-40"
      >
        Save
      </button>
    </div>
  )
}
