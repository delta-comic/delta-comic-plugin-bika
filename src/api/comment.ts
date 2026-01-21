import { _bikaUser } from "./user"
import { uni } from "delta-comic-core"
import { bika } from "."
import { pluginName } from "@/symbol"
import { defaults } from "es-toolkit/compat"

export namespace _bikaComment {
  export interface RawBaseComment {
    _id: string
    content: string
    _user?: _bikaUser.RawUser
    totalComments: number
    isTop: boolean
    hide: boolean
    created_at: string
    likesCount: number
    commentsCount: number
    isLiked: boolean
  }
  export interface RawComment extends RawBaseComment {
    _comic: string
  }
  export interface RawMyComment extends RawBaseComment {
    _comic: {
      _id: string
      title: string
    }
  }
  export interface RawChildComment extends RawComment {
    _parent: string
  }

  export class BikaComment extends uni.comment.Comment {
    override sendComment(text: string, signal?: AbortSignal) {
      return bika.api.comment.sendChildComment(this.id, text, signal)
    }
    public override async like(signal?: AbortSignal) {
      const res = await bika.api.comment.likeComment(this.id, signal)
      return res === 'like'
    }
    public override async report(signal?: AbortSignal) {
      await bika.api.comment.reportComment(this.id, signal)
      return true
    }
    public override sender!: uni.user.User
    public override children = bika.api.comment.createChildCommentsStream(this.id)
    constructor(v: RawBaseComment) {
      const sender = new _bikaUser.User(defaults(v._user ?? {}, <_bikaUser.RawUser>{
        _id: Math.random().toString(),
        characters: [],
        exp: 0,
        gender: 'bot',
        level: 0,
        name: '匿名',
        slogan: '',
        title: '',
        verified: false
      }))
      super({
        childrenCount: v.commentsCount,
        content: {
          text: v.content,
          type: 'string'
        },
        id: v._id,
        isLiked: v.isLiked,
        likeCount: v.likesCount,
        time: new Date(v.created_at).getTime(),
        sender,
        reported: v.hide,
        $$plugin: pluginName,
        $$meta: {
          raw: v
        },
        isTop: v.isTop
      })
      this.sender = sender
    }
  }
}