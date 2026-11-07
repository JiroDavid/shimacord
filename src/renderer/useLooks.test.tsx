import { renderHook, act, waitFor } from '@testing-library/react'
import { useLooks } from './useLooks'
import type { Look, LookInput } from '../shared/types'

let store: Look[]
beforeEach(() => {
  store = [{ id: 'a', name: 'A', kind: 'custom', appId: null, gameName: null, details: 'dd', state: '', largeImageUrl: '', smallImageUrl: '', showTimer: false }]
  ;(window as unknown as { shima: unknown }).shima = {
    looks: {
      list: async () => [...store],
      save: async (input: LookInput, id?: string) => {
        const look = { ...input, id: id ?? 'new' }
        store = id ? store.map((l) => (l.id === id ? look : l)) : [...store, look]
        return look
      },
      duplicate: async (id: string) => {
        const copy = { ...store.find((l) => l.id === id)!, id: 'copy' }
        store = [...store, copy]
        return copy
      },
      remove: async (id: string) => {
        store = store.filter((l) => l.id !== id)
      }
    }
  }
})

test('loads looks and selects the first', async () => {
  const { result } = renderHook(() => useLooks())
  await waitFor(() => expect(result.current.looks).toHaveLength(1))
  expect(result.current.selectedId).toBe('a')
})

test('create adds a draft look and selects it', async () => {
  const { result } = renderHook(() => useLooks())
  await waitFor(() => expect(result.current.looks).toHaveLength(1))
  await act(async () => result.current.create())
  await waitFor(() => expect(result.current.looks).toHaveLength(2))
  expect(result.current.selectedId).toBe('new')
})

test('remove deselects when removing the selected look', async () => {
  const { result } = renderHook(() => useLooks())
  await waitFor(() => expect(result.current.looks).toHaveLength(1))
  await act(async () => result.current.remove('a'))
  await waitFor(() => expect(result.current.looks).toHaveLength(0))
  expect(result.current.selectedId).toBeNull()
})

test('duplicate selects the copy', async () => {
  const { result } = renderHook(() => useLooks())
  await waitFor(() => expect(result.current.looks).toHaveLength(1))
  await act(async () => result.current.duplicate('a'))
  await waitFor(() => expect(result.current.selectedId).toBe('copy'))
})
