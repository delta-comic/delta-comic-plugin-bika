import { _bikaImage } from './image'
import { uni } from 'delta-comic-core'
import { pluginName } from '@/symbol'
export namespace _bikaUser {
  export type Gender = 'f' | 'm' | 'bot'
  export interface RawUser {
    _id: string
    gender: Gender
    name: string
    verified: boolean
    exp: number
    level: number
    characters: string[]
    role?: string
    title: string
    slogan: string
    avatar?: _bikaImage.RawImage
  }

  export class User extends uni.user.User {
    public override customUser: RawUser
    constructor(v: RawUser) {
      super({
        avatar: v.avatar ? {
          $$plugin: pluginName,
          forkNamespace: 'default',
          path: v.avatar.path ?? ''
        } : undefined,
        id: v._id,
        name: v.name,
        $$plugin: pluginName
      })
      this.customUser = v
    }
  }

  export interface RawUserMe extends RawUser {
    birthday: string
    email: string
    created_at: string
    isPunched: boolean
  }
  export class UserMe extends uni.user.User {
    public override customUser: RawUserMe
    constructor(v: RawUserMe) {
      super({
        avatar: v.avatar ? {
          $$plugin: pluginName,
          forkNamespace: 'default',
          path: v.avatar.path ?? ''
        } : undefined,
        id: v._id,
        name: v.name,
        $$plugin: pluginName
      })
      this.customUser = v
    }
  }

  export interface RawKnight extends RawUser {
    comicsUploaded: number
  }
  export class Knight extends uni.user.User {
    public override customUser: RawKnight
    constructor(v: RawKnight) {
      super({
        avatar: v.avatar ? {
          $$plugin: pluginName,
          forkNamespace: 'default',
          path: v.avatar.path ?? ''
        } : undefined,
        id: v._id,
        name: v.name,
        $$plugin: pluginName
      })
      this.customUser = v
    }
  }
}