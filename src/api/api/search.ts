import { Utils, type PluginConfigSearchHotPageLevelboard, type uni } from 'delta-comic-core'
import type { bika as BikaType } from '..'
import { bikaStream, createClassFromResponse, createCommonToUniItem, createLessToUniItem, createStructFromResponseStream } from "./utils"
import { bikaStore } from '@/store'
import { _bikaSearch } from '../search'
import { _bikaUser } from '../user'
import { random } from 'es-toolkit/compat'
export namespace _bikaApiSearch {
  const { PromiseContent } = Utils.data
  export const getHotTags = PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => (await bikaStore.api.value!.get<{ keywords: string[] }>("/keywords", { signal })).keywords)

  export const getRandomComic = window.$$safe$$ ?
    PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => (await _bikaApiSearch.utils.getComicsByKeyword('無H內容', random(0, 100), 'dd', signal)).docs)
    : PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => (await bikaStore.api.value!.get<{ comics: BikaType.comic.RawCommonComic[] }>(`/comics/random`, { signal })).comics.map(c => createCommonToUniItem(c)))

  export const getCollections = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => createClassFromResponse(bikaStore.api.value!.get<{ collections: BikaType.search.RawCollection[] }>("/collections", { signal }), _bikaSearch.Collection, 'collections'))

  export const getCategories = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => createClassFromResponse(bikaStore.api.value!.get<{ categories: BikaType.search.RawCategory[] }>("/categories", { signal }), _bikaSearch.Category, 'categories'))

  export const getLevelboard = () => [{
    name: '日排行',
    content: () => PromiseContent.fromPromise(bikaStore.api.value!.get<{ comics: BikaType.comic.RawLessComic[] }>('/comics/leaderboard?tt=H24&ct=VC'))
      .setProcessor(v => {
        const c = v.comics
        return c.map(c => createLessToUniItem(c))
      })
  }, {
    name: '周排行',
    content: () => PromiseContent.fromPromise(bikaStore.api.value!.get<{ comics: BikaType.comic.RawLessComic[] }>('/comics/leaderboard?tt=D7&ct=VC'))
      .setProcessor(v => {
        const c = v.comics
        return c.map(c => createLessToUniItem(c))
      })
  }, {
    name: '月排行',
    content: () => PromiseContent.fromPromise(bikaStore.api.value!.get<{ comics: BikaType.comic.RawLessComic[] }>('/comics/leaderboard?tt=D30&ct=VC'))
      .setProcessor(v => {
        const c = v.comics
        return c.map(c => createLessToUniItem(c))
      })
  }] satisfies PluginConfigSearchHotPageLevelboard[]

  export const getInit = (signal?: AbortSignal) => PromiseContent.fromPromise(bikaStore.api.value!.get<BikaType.search.Init>('/init?platform=android', { signal }))
}
export namespace _bikaApiSearch.utils {
  const { PromiseContent } = Utils.data
  export const getComicsByKeyword = PromiseContent.fromAsyncFunction(async (keyword: string, page = 1, sort: BikaType.SortType = 'dd', signal?: AbortSignal) =>
    createStructFromResponseStream((bikaStore.api.value!.post<{ comics: BikaType.api.pica.RawStream<BikaType.comic.RawCommonComic> }>(`/comics/advanced-search?page=${page}&sort=${sort}`, { keyword, sort }, { signal })), createCommonToUniItem)
  )
  const createSearchComicStream = (keyword: string, sort: BikaType.SortType, api: (keyword: string, page?: any, sort?: BikaType.SortType | undefined, signal?: AbortSignal | undefined) => PromiseLike<BikaType.api.pica.RawStream<uni.item.Item>>) => bikaStream((page, signal) => api(keyword, page, sort, signal))
  export const createKeywordStream = (keyword: string, sort: BikaType.SortType) => createSearchComicStream(keyword, sort, getComicsByKeyword)

  export const getComicsByAuthor = PromiseContent.fromAsyncFunction(async (author: string, page = 1, sort: BikaType.SortType = 'dd', signal?: AbortSignal) => {
    const data = await getComicsByKeyword(author, page, sort, signal)
    data.docs = data.docs.filter(v => v.author.some(a => a.label.trim().includes(author.trim())))
    return data
  })
  export const createAuthorStream = (author: string, sort: BikaType.SortType) => createSearchComicStream(author, sort, getComicsByAuthor)

  export const getComicsByUploader = PromiseContent.fromAsyncFunction((id: string, page = 1, sort: BikaType.SortType = 'dd', signal?: AbortSignal) => createStructFromResponseStream(bikaStore.api.value!.get<{ comics: BikaType.api.pica.RawStream<BikaType.comic.RawLessComic> }>(`/comics?page=${page}&ca=${(id)}&s=${sort}`, { signal }), createLessToUniItem))
  export const createUploaderStream = (uploader: string, sort: BikaType.SortType) => createSearchComicStream(uploader, sort, getComicsByUploader)

  
  export const getComicsByCategories = PromiseContent.fromAsyncFunction((category: string, page = 1, sort: BikaType.SortType = 'dd', signal?: AbortSignal) => createStructFromResponseStream(bikaStore.api.value!.get<{ comics: BikaType.api.pica.RawStream<BikaType.comic.RawLessComic> }>(`/comics?page=${page}&c=${(category)}&s=${sort}`, { signal }), createLessToUniItem))
  export const createCategoryStream = (category: string, sort: BikaType.SortType) => createSearchComicStream(category, sort, getComicsByCategories)

  export const getComicsByTag = PromiseContent.fromAsyncFunction((tag: string, page = 1, sort: BikaType.SortType = 'dd', signal?: AbortSignal) => createStructFromResponseStream(bikaStore.api.value!.get<{ comics: BikaType.api.pica.RawStream<BikaType.comic.RawLessComic> }>(`/comics?page=${page}&t=${(tag)}&s=${sort}`, { signal }), createLessToUniItem))
  export const createTagStream = (tag: string, sort: BikaType.SortType) => createSearchComicStream(tag, sort, getComicsByTag)

}
