import { flatten, times, sortBy } from "es-toolkit/compat"
import type { bika as BikaType } from '..'
import { bikaStream, createClassFromResponseStream, createFullToUniItem, createLessToUniItem, createStructFromResponse } from "./utils"
import { Store, uni, Utils } from "delta-comic-core"
import { pluginName } from "@/symbol"
import { config } from "@/config"
import { bikaStore } from "@/store"
import { _bikaComic } from "../comic"
export namespace _bikaApiComic {
  const { PromiseContent } = Utils.data
  export type ResultActionData<T extends string> = { action: T }
  export const likeComic = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => bikaStore.api.value!.post<ResultActionData<'like' | 'unlike'>>(`/comics/${id}/like`, {}, { signal }))
  export const favouriteComic = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => bikaStore.api.value!.post<ResultActionData<'favourite' | 'un_favourite'>>(`/comics/${id}/favourite`, {}, { signal }))

  const infoStore = new Map<string, uni.item.Item | false>()
  export const getComicInfo = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => {
    if (infoStore.has(id)) return infoStore.get(id)!
    const data = (await bikaStore.api.value!.get<{ comic: BikaType.comic.RawFullComic } | false>(`/comics/${id}`, { signal }))
    if (data) infoStore.set(id, createFullToUniItem(data.comic))
    else infoStore.set(id, false)
    return infoStore.get(id)!
  })

  const picIdStore = new Map<string, number>()
  export const getComicPicId = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => {
    if (picIdStore.has(id)) return picIdStore.get(id)!
    const result = await bikaStore.share.value!.get<{ shareId: number }>(`/pic/share/set/?c=${id}`, { signal })
    const picId = result.shareId
    picIdStore.set(id, picId)
    return picId
  })

  export const getComicIdByPicId = PromiseContent.fromAsyncFunction(async (picId: string, signal?: AbortSignal) => {
    const result = await bikaStore.share.value!.get<{ cid: string }>(`/pic/share/get/?shareId=${picId}`, { signal })
    const id = result.cid
    return id
  })

  export const getComicByPicId = PromiseContent.fromAsyncFunction(async (picId: string, signal?: AbortSignal) => {
    const id = await getComicIdByPicId(picId, signal)
    const data = await getComicInfo(id, signal)
    return data
  })

  export const getRecommendComics = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => createStructFromResponse(bikaStore.api.value!.get<{ comics: BikaType.comic.RawLessComic[] }>(`/comics/${id}/recommendation`, { signal }), createLessToUniItem, 'comics'))


  export const getComicEps = PromiseContent.fromAsyncFunction((async (id: string, signal?: AbortSignal): Promise<uni.ep.Ep[]> => {
    const stream = bikaStream(async (page, signal) => (await bikaStore.api.value!.get<{ eps: BikaType.api.pica.RawStream<BikaType.comic.RawComicEp> }>(`/comics/${id}/eps?page=${page}`, { signal })).eps)
    const eps = await stream.nextToDone()
    signal?.addEventListener('abort', () => {
      stream.stop()
    })
    return eps.map(ep => new uni.ep.Ep({
      $$plugin: pluginName,
      name: ep.title,
      index: String(ep.order)
    }))
  }))

  type Pages = BikaType.api.pica.RawStream<BikaType.comic.RawPage>
  const comicsPagesCache = new Map<string, Pages[]>()
  export const getComicPage = (id: string, index: number, page: number, signal?: AbortSignal) => createClassFromResponseStream(bikaStore.api.value!.get<{ pages: Pages }>(`/comics/${id}/order/${index}/pages?page=${page}`, { signal }), _bikaComic.Page, 'pages')
  export const clearComicPagesTemp = () => comicsPagesCache.clear()
  const comicPageRequesting = new Map<string, Promise<BikaType.comic.Page[]>>()
  export const getComicPages = (async (id: string, index: number, signal?: AbortSignal) => {
    const key = id + '|' + index + '|' + Store.useConfig().$load(config).value.imageQuality
    const pageDB = comicsPagesCache.get(key)
    if (pageDB) return flatten(pageDB.map(v => v.docs.map(v => new _bikaComic.Page(v))))
    if (comicPageRequesting.has(key)) return comicPageRequesting.get(key)!
    const _pages = new Promise<BikaType.comic.Page[]>(async r => {
      const firstPage = await getComicPage(id, index, 1, signal)
      const otherPages = new Array<BikaType.api.pica.RawStream<BikaType.comic.Page>>()
      otherPages.push(firstPage)
      otherPages.push(...await Promise.all(times(firstPage.pages - 1, i => getComicPage(id, index, i + 2, signal))))
      const pages = flatten(sortBy(otherPages, 'page').map(v => v.docs.map(v => new _bikaComic.Page(v))))
      r(pages)
      comicsPagesCache.set(key, sortBy(otherPages, 'page'))
    })
    comicPageRequesting.set(key, _pages)
    const pages = await _pages
    comicPageRequesting.delete(key)
    return pages
  })
  export const createComicEpPageStream = (comicId: string, epIndex: number) => bikaStream((page, signal) => getComicPage(comicId, epIndex, page, signal))
}