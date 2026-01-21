
import { _bikaComic } from "./comic"
import { _bikaImage } from "./image"
import { _bikaSearch } from "./search"
import { _bikaComment } from "./comment"
import { _bikaAuth } from "./auth"
import { _bikaUser } from "./user"
import { _bikaApiAuth } from "./api/auth"
import { _bikaApiComic } from "./api/comic"
import { _bikaApiComment } from "./api/comment"
import { _bikaApiSearch } from "./api/search"
import { _bikaApiUser } from "./api/user"


export namespace bika {
  export type ImageQuality = 'low' | 'medium' | 'high' | 'original'
  export type SortType = 'dd' | 'da' | 'ld' | 'vd'
  export const sorts = [{
    text: '新到旧',
    value: <bika.SortType>'dd'
  }, {
    text: '旧到新',
    value: <bika.SortType>'da'
  }, {
    text: '点赞数最多',
    value: <bika.SortType>'ld'
  }, {
    text: '观看数最多',
    value: <bika.SortType>'vd'
  }]
  export type SearchMode = "pid" | "uploader" | "keyword" | 'category' | 'tag'
  export interface FillerTag {
    name: string
    mode: "hidden" | "show" | "auto"
  }

  export import comic = _bikaComic
  export import auth = _bikaAuth
  export import user = _bikaUser
  export import image = _bikaImage
  export import search = _bikaSearch
  export import comment = _bikaComment
}


export namespace bika.api {
  export import auth = _bikaApiAuth
  export import comic = _bikaApiComic
  export import user = _bikaApiUser
  export import search = _bikaApiSearch
  export import comment = _bikaApiComment
}


export namespace bika.api.pica {
  export type RawResponse<T = any> = {
    message: string,
    code: 200,
    data?: T,
    error?: undefined
  } | {
    message: string,
    code: number,
    data: undefined,
    error: string
  }
  export type Response<T = any> = {
    message: string,
    code: 200,
    data: T,
  }
  export interface RawStream<T> {
    docs: T[]
    limit: number
    page: string | number
    pages: number
    total: number
  }

  // eventBus.on('networkError_unauth', () => {
  //   const bikaStore = useBikaStore()
  //   bikaStore.loginToken = ''
  // })
}
window.$api.bika = bika