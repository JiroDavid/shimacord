import { Mascot } from './Mascot'

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Mascot size={110} />
      <p className="text-sm tracking-wide">no looks yet</p>
      <button
        onClick={onCreate}
        className="rounded-full bg-shiba px-4 py-1.5 text-sm text-paper hover:brightness-110"
      >
        Create your first look
      </button>
    </div>
  )
}
