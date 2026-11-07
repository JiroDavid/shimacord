import { useEffect, useState } from 'react'
import type { LookInput, PresenceStatus } from '../shared/types'
import { validateLook } from '../shared/validate'
import { TitleBar } from './components/TitleBar'
import { LooksList } from './components/LooksList'
import { Editor } from './components/Editor'
import { Preview } from './components/Preview'
import { GoLiveBar } from './components/GoLiveBar'
import { useLooks } from './useLooks'

const idle: PresenceStatus = { state: 'idle', lookId: null, message: null }

export function App() {
  const { looks, selectedId, select, create, save, duplicate, remove } = useLooks()
  const [draft, setDraft] = useState<LookInput | null>(null)
  const [status, setStatus] = useState<PresenceStatus>(idle)

  useEffect(() => {
    const api = window.shima?.presence
    if (!api) return
    api.status().then(setStatus)
    return api.onStatus(setStatus)
  }, [])

  const selected = looks.find((l) => l.id === selectedId) ?? null
  useEffect(() => {
    if (!selected) return setDraft(null)
    const { id: _id, ...input } = selected
    setDraft(input)
  }, [selected])

  const valid = draft !== null && validateLook(draft).length === 0
  const live = status.state === 'live' && status.lookId === selectedId

  const goLive = async () => {
    if (!draft || !selectedId || !valid) return
    await save(draft)
    await window.shima.presence.goLive(selectedId)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TitleBar />
      <main className="grid flex-1 grid-cols-[240px_1fr_320px] gap-4 p-4">
        <section className="rounded-2xl bg-tan/40 p-3">
          <h2 className="mb-2 text-[11px] uppercase tracking-widest">
            Looks <span className="font-kanji">· 装い</span>
          </h2>
          <LooksList
            looks={looks}
            selectedId={selectedId}
            onSelect={select}
            onCreate={create}
            onDuplicate={duplicate}
            onRemove={remove}
          />
        </section>
        <section className="rounded-2xl bg-tan/40 p-4">
          <h2 className="mb-3 text-[11px] uppercase tracking-widest">
            Editor <span className="font-kanji">· 編集</span>
          </h2>
          {draft && <Editor value={draft} onChange={setDraft} onSave={() => save(draft)} />}
        </section>
        <section className="flex flex-col gap-4 rounded-2xl bg-tan/40 p-4">
          <h2 className="text-[11px] uppercase tracking-widest">
            Preview <span className="font-kanji">· 見本</span>
          </h2>
          {draft && <Preview look={draft} live={live} />}
          <div className="mt-auto">
            <GoLiveBar
              status={status}
              selectedId={selectedId}
              valid={valid}
              onGoLive={goLive}
              onStop={() => window.shima.presence.stop()}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
