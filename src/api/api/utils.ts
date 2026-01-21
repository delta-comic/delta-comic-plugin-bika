import { uni, Utils } from 'delta-comic-core'
import { bika } from '..'
import { pluginName } from '@/symbol'
import { BikaPage } from '../page'
import { isArray, isEmpty } from 'es-toolkit/compat'


export function bikaStream<T>(api: (page: number, signal: AbortSignal) => PromiseLike<bika.api.pica.RawStream<T>>) {
  return Utils.data.Stream.create<T>(async function* (signal, that) {
    while (true) {
      if (that.pages.value <= that.page.value) return
      that.page.value++
      const result = await api(that.page.value, signal)
      that.pages.value = result.pages
      that.total.value = result.total
      that.pageSize.value = result.limit
      that.page.value = Number(result.page)
      yield result.docs
    }
  })
}

export const createClassFromResponse = async<T extends Record<string, any[]>, TResult>(source: PromiseLike<T>, box: new (source: T[keyof T][number]) => TResult, key: keyof T) => {
  const data = await source
  const s = data[key]
  return s.map(v => new box(v))
}
export const createStructFromResponse = async<T extends Record<string, any[]>, TResult>(source: PromiseLike<T>, box: (source: T[keyof T][number]) => TResult, key: keyof T) => {
  const data = await source
  const s = data[key]
  return s.map(box)
}

export const createClassFromResponseStream = async<T extends Record<string, bika.api.pica.RawStream<any>>, TResult>(v: Promise<T>, box: new (data: T[keyof T]['docs'][number]) => TResult, key: keyof T = 'comics'): Promise<bika.api.pica.RawStream<TResult>> => {
  const data = await v
  const s = data[key]
  s.docs = s.docs.map(v => new box(v))
  return s
}
export const createStructFromResponseStream = async<T extends Record<string, bika.api.pica.RawStream<any>>, TResult>(v: Promise<T>, box: (data: T[keyof T]['docs'][number]) => TResult, key: keyof T = 'comics'): Promise<bika.api.pica.RawStream<TResult>> => {
  const data = await v
  const s = data[key]
  s.docs = s.docs.map(box)
  return s
}

export const spiltUsers = (userString = '') => userString.split(/\,|，|\&|\||、|＆|(\sand\s)|(\s和\s)|(\s[xX]\s)/ig).filter(Boolean).map(v => v.trim()).filter(Boolean)
const isCosplay = (categories: string[]) => categories.includes('COSPLAY') || categories.includes('Cosplay')
const createAuthor = (comic: bika.comic.RawBaseComic) => spiltUsers(comic.author).map<uni.item.Author>(v => ({
  label: v,
  description: isCosplay(comic.categories) ? 'coser' : '作者',
  icon: isCosplay(comic.categories) ? 'coser' : 'draw',
  actions: [
    'search'
  ],
  subscribe: 'keyword',
  $$plugin: pluginName
}))
const createAuthorList = (...authors: (uni.item.Author | uni.item.Author[] | undefined | false)[]) => {
  const _authors = new Array<uni.item.Author>()
  for (const author of authors) {
    if (!author) continue
    if (isArray(author))
      _authors.push(...author)
    else
      _authors.push(author)
  }
  return _authors
}

export const createFullToUniItem = (comic: bika.comic.RawFullComic) => bika.comic.BikaItem.create({
  $$meta: {
    comic
  },
  $$plugin: pluginName,
  author: createAuthorList(
    createAuthor(comic),
    comic._creator && {
      label: comic._creator.name,
      description: "上传者",
      icon: {
        $$plugin: pluginName,
        forkNamespace: 'default',
        path: comic._creator.avatar?.path ?? ''
      },
      actions: [
        'search_uploader',
      ],
      subscribe: 'uploader',
      $$meta: {
        user: comic._creator
      },
      $$plugin: pluginName
    },
    !isEmpty(comic.chineseTeam) && {
      label: comic.chineseTeam,
      description: "翻译",
      icon: 'trans',
      actions: [
        'search',
      ],
      subscribe: 'keyword',
      $$plugin: pluginName
    }
  ),
  categories: comic.categories.map(v => ({
    name: v,
    group: '分类',
    search: {
      keyword: v,
      sort: bika.sorts[0].value,
      source: 'keyword'
    }
  })).concat(comic.tags.map(v => ({
    name: v,
    group: '标签',
    search: {
      keyword: v,
      sort: bika.sorts[0].value,
      source: 'keyword'
    }
  }))),
  cover: {
    $$plugin: pluginName,
    forkNamespace: 'default',
    path: comic.thumb.path,
  },
  title: comic.title,
  id: comic._id,
  viewNumber: comic.viewsCount,
  likeNumber: comic.likesCount,
  commentNumber: comic.commentsCount,
  isLiked: comic.isLiked,
  updateTime: new Date(comic.updated_at).getTime(),
  customIsAI: false,
  contentType: BikaPage.contentType,
  length: String(comic.pagesCount),
  epLength: String(comic.epsCount),
  thisEp: {
    $$plugin: pluginName,
    index: "1",
    name: '',
  },
  description: comic.description,
  commentSendable: comic.allowComment,
  customIsSafe: comic.tags.includes('無H內容')
})

export const createCommonToUniItem = (comic: bika.comic.RawCommonComic) => bika.comic.BikaItem.create({
  $$meta: {
    comic
  },
  $$plugin: pluginName,
  author: createAuthorList(
    createAuthor(comic),
    !isEmpty(comic.chineseTeam) && {
      label: comic.chineseTeam,
      description: "翻译",
      icon: 'trans',
      actions: [
        'search',
      ],
      subscribe: 'keyword',
      $$plugin: pluginName
    }
  ),
  categories: comic.categories.map(v => ({
    name: v,
    group: '分类',
    search: {
      keyword: v,
      sort: bika.sorts[0].value,
      source: 'keyword'
    }
  })).concat(comic.tags.map(v => ({
    name: v,
    group: '标签',
    search: {
      keyword: v,
      sort: bika.sorts[0].value,
      source: 'keyword'
    }
  }))),
  cover: {
    $$plugin: pluginName,
    forkNamespace: 'default',
    path: comic.thumb.path,
  },
  title: comic.title,
  id: comic._id,
  viewNumber: comic.totalViews,
  likeNumber: comic.totalLikes ?? comic.likesCount,
  updateTime: new Date(comic.updated_at).getTime(),
  customIsAI: false,
  contentType: BikaPage.contentType,
  length: 'unknown',
  epLength: 'unknown',
  thisEp: {
    $$plugin: pluginName,
    index: "1",
    name: '',
  },
  commentSendable: false,
  customIsSafe: comic.tags.includes('無H內容')
})
export const createLessToUniItem = (comic: bika.comic.RawLessComic, mustSafe = false) => bika.comic.BikaItem.create({
  $$meta: {
    comic
  },
  $$plugin: pluginName,
  author: createAuthor(comic),
  categories: comic.categories.map(v => ({
    name: v,
    group: '分类',
    search: {
      keyword: v,
      sort: bika.sorts[0].value,
      source: 'keyword'
    }
  })),
  cover: {
    $$plugin: pluginName,
    forkNamespace: 'default',
    path: comic.thumb.path,
  },
  title: comic.title,
  id: comic._id,
  viewNumber: comic.totalViews,
  likeNumber: comic.totalLikes,
  customIsAI: false,
  contentType: BikaPage.contentType,
  length: String(comic.pagesCount),
  epLength: String(comic.epsCount),
  thisEp: {
    $$plugin: pluginName,
    index: "1",
    name: '',
  },
  commentSendable: false,
  customIsSafe: mustSafe
})