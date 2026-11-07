import { TitleBar } from './components/TitleBar'
import { EmptyState } from './components/EmptyState'

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <TitleBar />
      <main className="grid flex-1 grid-cols-[240px_1fr_320px] gap-4 p-4">
        <section className="rounded-2xl bg-tan/40 p-3">
          <h2 className="mb-2 text-[11px] uppercase tracking-widest">
            Looks <span className="font-kanji">· 装い</span>
          </h2>
          <EmptyState onCreate={() => undefined} />
        </section>
        <section className="rounded-2xl bg-tan/40 p-4" />
        <section className="rounded-2xl bg-tan/40 p-4" />
      </main>
    </div>
  )
}
