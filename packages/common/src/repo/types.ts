import { z } from 'zod'
import { BlockWriter } from '@ipld/car/writer'
import { schema as common } from '../common/types'
import TID from './tid'
import CidSet from './cid-set'
import { CID } from 'multiformats'
import { DataDiff } from './mst'

const tid = z.instanceof(TID)

const strToTid = z
  .string()
  .refine(TID.is, { message: 'Not a valid TID' })
  .transform(TID.fromStr)

const repoRoot = z.object({
  did: common.did,
  prev: common.cid.nullable(),
  auth_token: common.cid,
  data: common.cid,
})
export type RepoRoot = z.infer<typeof repoRoot>

const namespaceRoot = z.object({
  posts: common.cid,
  interactions: common.cid,
  profile: common.cid.nullable(),
})
export type NamespaceRoot = z.infer<typeof namespaceRoot>

const commit = z.object({
  root: common.cid,
  sig: common.bytes,
})
export type Commit = z.infer<typeof commit>

const idMapping = z.record(common.cid)
export type IdMapping = z.infer<typeof idMapping>

const tidEntry = z.object({
  tid: tid,
  cid: common.cid,
})
export type TIDEntry = z.infer<typeof tidEntry>

const didEntry = z.object({
  did: z.string(),
  cid: common.cid,
})
export type DIDEntry = z.infer<typeof didEntry>

const collection = z.enum(['posts', 'interactions', 'profile'])
export type Collection = z.infer<typeof collection>

const follow = z.object({
  did: z.string(),
  username: z.string(),
})
export type Follow = z.infer<typeof follow>

export type UpdateData = {
  namespace?: string
  collection?: Collection
  tid?: TID
  did?: string
  newCids: CidSet
}

export const schema = {
  ...common,
  tid,
  strToTid,
  repoRoot,
  namespaceRoot,
  commit,
  idMapping,
  tidEntry,
  didEntry,
  collection,
  follow,
}

export interface CarStreamable {
  writeToCarStream(car: BlockWriter): Promise<void>
}

// @TODO dedup from api/types
export interface BatchWrite {
  action: 'create' | 'update' | 'del'
  collection: string
  key: string
  value: any
}

export type DataValue = {
  key: string
  value: CID
}

export interface DataStore {
  add(key: string, value: CID): Promise<DataStore>
  update(key: string, value: CID): Promise<DataStore>
  delete(key: string): Promise<DataStore>
  get(key: string): Promise<CID | null>
  list(from: string, count: number): Promise<DataValue[]>
  listWithPrefix(from: string, count?: number): Promise<DataValue[]>
  diff(other: DataStore): Promise<DataDiff>
  save(): Promise<CID>
  writeToCarStream(car: BlockWriter): Promise<void>
}
