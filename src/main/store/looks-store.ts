import { copyFileSync, existsSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'
import type { Look, LookInput } from '../../shared/types'

export class LooksStore {
  constructor(private readonly filePath: string) {}

  list(): Look[] {
    if (!existsSync(this.filePath)) return []
    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8'))
      if (!Array.isArray(parsed)) throw new Error('not a list')
      return parsed as Look[]
    } catch {
      copyFileSync(this.filePath, this.filePath + '.bak')
      return []
    }
  }

  save(input: LookInput, id?: string): Look {
    const looks = this.list()
    const look: Look = { ...input, id: id ?? randomUUID() }
    const index = looks.findIndex((l) => l.id === look.id)
    if (index >= 0) looks[index] = look
    else looks.push(look)
    this.write(looks)
    return look
  }

  duplicate(id: string): Look {
    const source = this.list().find((l) => l.id === id)
    if (!source) throw new Error(`No look with id ${id}`)
    const { id: _id, ...rest } = source
    return this.save({ ...rest, name: `${source.name} copy` })
  }

  remove(id: string): void {
    this.write(this.list().filter((l) => l.id !== id))
  }

  private write(looks: Look[]): void {
    const tmp = this.filePath + '.tmp'
    writeFileSync(tmp, JSON.stringify(looks, null, 2))
    renameSync(tmp, this.filePath)
  }
}
