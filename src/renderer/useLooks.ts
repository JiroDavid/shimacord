import { useCallback, useEffect, useState } from 'react'
import type { Look, LookInput } from '../shared/types'

export const blankLook: LookInput = {
  name: 'New look',
  kind: 'custom',
  appId: null,
  gameName: null,
  details: 'Hello there',
  state: '',
  largeImageUrl: '',
  smallImageUrl: '',
  showTimer: false
}

export function useLooks() {
  const [looks, setLooks] = useState<Look[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLooks(await window.shima.looks.list())
  }, [])

  useEffect(() => {
    window.shima.looks.list().then((list) => {
      setLooks(list)
      setSelectedId((cur) => cur ?? list[0]?.id ?? null)
    })
  }, [])

  const create = useCallback(async () => {
    const look = await window.shima.looks.save(blankLook)
    await reload()
    setSelectedId(look.id)
  }, [reload])

  const save = useCallback(
    async (input: LookInput) => {
      if (!selectedId) return
      await window.shima.looks.save(input, selectedId)
      await reload()
    },
    [selectedId, reload]
  )

  const duplicate = useCallback(
    async (id: string) => {
      const copy = await window.shima.looks.duplicate(id)
      await reload()
      setSelectedId(copy.id)
    },
    [reload]
  )

  const remove = useCallback(
    async (id: string) => {
      await window.shima.looks.remove(id)
      await reload()
      setSelectedId((cur) => (cur === id ? null : cur))
    },
    [reload]
  )

  return { looks, selectedId, select: setSelectedId, create, save, duplicate, remove }
}
