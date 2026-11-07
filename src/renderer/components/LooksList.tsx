import type { Look } from '../../shared/types'
import { EmptyState } from './EmptyState'

type Props = {
  looks: Look[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDuplicate: (id: string) => void
  onRemove: (id: string) => void
}

export function LooksList({ looks, selectedId, onSelect, onCreate, onDuplicate, onRemove }: Props) {
  if (looks.length === 0) return <EmptyState onCreate={onCreate} />
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {looks.map((look) => {
          const selected = look.id === selectedId
          return (
            <li
              key={look.id}
              className={`flex items-center gap-1 rounded-xl px-1 ${selected ? 'bg-paper ring-1 ring-shiba' : 'bg-tan/50'}`}
            >
              <button
                onClick={() => onSelect(look.id)}
                aria-current={selected ? 'true' : undefined}
                className="flex-1 truncate px-2 py-2 text-left text-sm"
              >
                {look.name}
              </button>
              <button
                aria-label={`Duplicate ${look.name}`}
                onClick={() => onDuplicate(look.id)}
                className="px-1 text-xs opacity-60 hover:opacity-100"
              >
                ⧉
              </button>
              <button
                aria-label={`Delete ${look.name}`}
                onClick={() => onRemove(look.id)}
                className="px-1 text-xs opacity-60 hover:text-shiba hover:opacity-100"
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>
      <button
        onClick={onCreate}
        className="rounded-xl border border-dashed border-ink/40 py-2 text-sm hover:bg-paper"
      >
        + New look
      </button>
    </div>
  )
}
