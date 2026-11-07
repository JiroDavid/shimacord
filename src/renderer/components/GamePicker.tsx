import { useEffect, useState } from 'react'
import type { GameEntry } from '../../shared/types'

export function GamePicker({ onPick }: { onPick: (g: GameEntry) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GameEntry[]>([])
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    window.shima.games.status().then((s) => setUnavailable(s === 'none'))
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      window.shima.games.search(query).then(setResults)
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search games..."
        className="w-full rounded-lg border border-tan bg-paper px-3 py-2 text-sm"
      />
      {unavailable && (
        <p className="mt-1 text-xs text-shiba">Game list unavailable - custom looks still work.</p>
      )}
      <ul className="mt-1 flex flex-col">
        {results.map((g) => (
          <li key={g.appId}>
            <button
              onClick={() => {
                onPick(g)
                setQuery('')
                setResults([])
              }}
              className="w-full rounded px-2 py-1 text-left text-sm hover:bg-tan/50"
            >
              {g.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
