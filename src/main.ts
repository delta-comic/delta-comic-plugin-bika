import '@/index.css'
import { SharedFunction } from '@delta-comic/core'
import { uni } from '@delta-comic/model'
import {
  definePlugin,
  Global,
  require,
  type PluginExpose,
  type Subscribe
} from '@delta-comic/plugin'
import { createAxios, interceptors } from '@delta-comic/request'
import type {} from '@delta-comic/utils'
import { UserOutlined } from '@vicons/antd'
import { DrawOutlined, GTranslateOutlined, SearchOutlined } from '@vicons/material'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { MD5 } from 'crypto-js'
import dayjs from 'dayjs'
import { first, inRange, isEmpty } from 'es-toolkit/compat'

import { bika } from './api'
import { api, image, share } from './api/forks'
import { getBikaApiHeaders } from './api/header'
import { BikaPage } from './api/page'
import Card from './components/card.vue'
import CommentRow from './components/commentRow.vue'
import Edit from './components/edit.vue'
import Tabbar from './components/tabbar.vue'
import User from './components/user.vue'
import { config } from './config'
import { LayoutPlugin } from './depend'
import { bikaStore } from './store'
import { pluginName } from './symbol'

const { layout } = require(LayoutPlugin)

const testAxios = axios.create({
  timeout: 7000,
  method: 'GET',
  validateStatus(status) {
    return inRange(status, 199, 499)
  }
})

testAxios.interceptors.response.use(undefined, interceptors.createAutoRetry(testAxios, 2))

const diff = async (
  that: Subscribe.Config,
  olds: Parameters<Subscribe.Config['getUpdateList']>[0],
  signal?: AbortSignal
) => {
  const allList = await Promise.all(
    olds.map(async v => {
      const stream = that.getListStream(v.author)
      signal?.addEventListener('abort', () => stream.stop())
      const news = (await stream.next()).value
      if (!news) throw new Error(`[subscribe] ${v.author.label} is void!`)
      return { author: v.author, list: news }
    })
  )
  const changedAuthors = new Array<uni.item.Author>()
  for (const item of allList) {
    const key = item.author.label
    const old = olds.find(o => o.author.label === key)

    const newFirst = first(item.list)
    const oldFirst = first(old?.list)

    let changed = false
    if (oldFirst && newFirst) changed = newFirst.id !== oldFirst.id
    else changed = true
    if (changed) changedAuthors.push(item.author)
  }

  return { isUpdated: isEmpty(changedAuthors), whichUpdated: changedAuthors }
}

const plugin = definePlugin({
  name: pluginName,
  api: {
    api: { forks: () => api, test: (fork, signal) => testAxios.get(fork, { signal }) },
    share: {
      forks: () => share,
      test: (fork, signal) =>
        testAxios.get(`${fork}/pic/share/set/?c=685d566e5709fd7e61ea2c4f`, { signal })
    }
  },
  resource: {
    types: [
      {
        type: 'default',
        test: async (url, signal) => {
          const body = await fetch(`${url}/89173fc7-cce7-4957-b465-c9c9f5550756.jpg`, { signal })
          if (!body.ok) throw new Error('fail to connect')
        },
        urls: image
      }
    ]
  },
  user: {
    card: User,
    edit: Edit,
    syncFavourite: {
      download() {
        const stream = bika.api.user.createFavouriteComicStream()
        return stream.nextToDone()
      },
      upload(items) {
        return Promise.all(
          items.map(v =>
            bika.api.comic.favouriteComic(v.id).then(r => {
              if (r.action === 'un_favourite') {
                return bika.api.comic.favouriteComic(v.id)
              }
            })
          )
        )
      }
    },
    userActions: {
      search_uploader: {
        name: '搜索该上传者',
        call(author) {
          const user: bika.user.RawUser = author.$$meta?.user
          return SharedFunction.call('routeToSearch', user._id, [pluginName, 'uploader'])
        },
        icon: SearchOutlined
      },
      search: {
        name: '搜索',
        call(author) {
          return SharedFunction.call('routeToSearch', author.label, [pluginName, 'keyword'])
        },
        icon: SearchOutlined
      }
    },
    authorIcon: { coser: UserOutlined, draw: DrawOutlined, trans: GTranslateOutlined }
  },
  subscribe: {
    keyword: {
      getListStream: author => bika.api.search.utils.createKeywordStream(author.label, 'dd'),
      getUpdateList(olds, signal) {
        return diff(this, olds, signal)
      }
    },
    uploader: {
      getListStream: author =>
        bika.api.search.utils.createUploaderStream(author.$$meta?.user._id ?? 'fail', 'dd'),
      getUpdateList(olds, signal) {
        return diff(this, olds, signal)
      }
    }
  },
  content: {
    [BikaPage.contentType]: {
      contentPage: BikaPage,
      layout: layout.Default,
      itemCard: Card,
      commentRow: CommentRow,
      itemTranslator: raw => bika.comic.BikaItem.create(raw)
    }
  },
  auth: {
    passSelect: async () => {
      console.log(bikaStore.loginData.value)
      return bikaStore.loginData.value.email !== '' ? 'logIn' : false
    },
    async logIn(by) {
      try {
        if (bikaStore.loginData.value.email !== '') var form = bikaStore.loginData.value
        else
          var form = (bikaStore.loginData.value = await by.form({
            email: { type: 'string', info: '用户名' },
            password: { type: 'string', info: '密码' }
          }))
        const res = await bika.api.auth.login(form)
        console.log(res)
        bikaStore.loginToken.value = res.token
      } catch (error) {
        bikaStore.loginData.value = null
        throw error
      }
    },
    async signUp(by) {
      const form = await by.form({
        email: { type: 'string', info: '用户名' },
        name: { type: 'string', info: '展示用户名' },
        password: { type: 'string', info: '密码' },
        birthday: { type: 'date', info: '生日', format: 'yyyy-MM-dd' },
        gender: {
          type: 'radio',
          comp: 'radio',
          info: '性别',
          selects: [
            { label: '男', value: 'm' },
            { label: '女', value: 'f' },
            { label: '隐藏', value: 'bot' }
          ]
        },
        question1: { type: 'string', info: '密保问题1' },
        answer1: { type: 'string', info: '密保答案1' },
        question2: { type: 'string', info: '密保问题2' },
        answer2: { type: 'string', info: '密保答案2' },
        question3: { type: 'string', info: '密保问题3' },
        answer3: { type: 'string', info: '密保答案3' }
      })
      await bika.api.auth.signUp({
        ...form,
        birthday: dayjs(form.birthday).format('YYYY-MM-DD'),
        gender: <bika.user.Gender>form.gender
      })
    }
  },
  onBooted: ins => {
    console.log('setup...', ins, ins.api?.api)
    if (ins.api?.api) {
      const f = ins.api.api
      const api = createAxios(
        () => f,
        {},
        ins => {
          ins.interceptors.request.use(requestConfig => {
            for (const value of getBikaApiHeaders(
              requestConfig.url ?? '/',
              requestConfig.method!.toUpperCase()
            ))
              requestConfig.headers.set(...value)
            return requestConfig
          })
          ins.interceptors.response.use(undefined, err => {
            if (err?.response && err.response.data.error == '1014')
              return Promise.resolve(<AxiosResponse>{
                data: false,
                config: err.config,
                headers: err.response?.headers,
                status: 200,
                statusText: '200',
                request: err.request
              }) // only /comic/:id
            return Promise.reject(err)
          })
          ins.interceptors.response.use(c => {
            if (!c.data.data && c.config.method?.toUpperCase() == 'GET')
              throw new Error('non-data response was been gotten.')
            c.data = c.data.data
            return c
          })
          return ins
        }
      )
      bikaStore.api.value = api
      SharedFunction.define(bika.api.search.getRandomComic, pluginName, 'getRandomProvide')
    }
    if (ins.api?.share) {
      const f = ins.api.share
      const share = createAxios(() => f)
      bikaStore.share.value = share
    }
    return { bika } as { bika: typeof bika }
  },
  otherProgress: [
    {
      name: '获取初始化信息',
      async call(setDescription) {
        setDescription('请求网络中')
        initData = await bika.api.search.getInit()
        Global.addCategories(
          pluginName,
          ...initData.categories.map(v => ({
            title: v.title,
            namespace: '',
            search: { methodId: 'category', input: v.title, sort: bika.sorts[0].value }
          }))
        )
        setDescription('成功')
      }
    },
    {
      name: '获取用户 & 签到',
      async call(setDescription) {
        setDescription('请求网络中')
        try {
          if (!initData.isPunched) await bika.api.user.punch()
        } catch {}
        const [user, collections] = await Promise.all([
          bika.api.user.getProfile(),
          bika.api.search.getCollections()
        ])
        uni.user.User.userBase.set(pluginName, user)
        bikaStore.collections.value = collections
        Global.addTabbar(
          pluginName,
          ...collections.map(c => ({ title: c.title, id: MD5(c.title).toString(), comp: Tabbar }))
        )
        setDescription('成功')
      }
    }
  ],
  search: {
    methods: {
      keyword: {
        defaultSort: bika.sorts[0].value,
        name: '关键词',
        sorts: bika.sorts,
        getStream(input, sort: bika.SortType) {
          return bika.api.search.utils.createKeywordStream(input, sort)
        },
        async getAutoComplete(input, signal) {
          const latest = await bika.api.search.utils.getComicsByKeyword(
            input,
            undefined,
            undefined,
            signal
          )
          return latest.docs.map(v => ({ text: v.title, value: v.title }))
        }
      },
      author: {
        defaultSort: bika.sorts[0].value,
        name: '作者',
        sorts: bika.sorts,
        getStream(input, sort: bika.SortType) {
          return bika.api.search.utils.createAuthorStream(input, sort)
        },
        async getAutoComplete(input, signal) {
          const latest = await bika.api.search.utils.getComicsByKeyword(
            input,
            undefined,
            undefined,
            signal
          )
          return latest.docs.map(v => ({ text: v.title, value: v.title }))
        }
      },
      category: {
        defaultSort: bika.sorts[0].value,
        name: '分类',
        sorts: bika.sorts,
        getStream(input, sort: bika.SortType) {
          return bika.api.search.utils.createCategoryStream(input, sort)
        },
        async getAutoComplete(input) {
          return initData.categories
            .filter(v => v.title.includes(input))
            .map(v => ({ text: v.title, value: v.title }))
        }
      },
      tag: {
        defaultSort: bika.sorts[0].value,
        name: '标签',
        sorts: bika.sorts,
        getStream(input, sort: bika.SortType) {
          return bika.api.search.utils.createTagStream(input, sort)
        },
        async getAutoComplete(input, signal) {
          const latest = await bika.api.search.utils.getComicsByKeyword(
            input,
            undefined,
            undefined,
            signal
          )
          return latest.docs.map(v => ({ text: v.title, value: v.title }))
        }
      },
      uploader: {
        defaultSort: bika.sorts[0].value,
        name: '上传者',
        sorts: bika.sorts,
        getStream(input, sort: bika.SortType) {
          return bika.api.search.utils.createUploaderStream(input, sort)
        },
        async getAutoComplete() {
          return []
        }
      }
    },
    hotPage: { levelBoard: bika.api.search.getLevelboard() },
    barcode: [
      {
        name: 'PICA号',
        match(searchText) {
          return /^PICA\d+$/i.test(searchText)
        },
        async getContent(searchText, signal) {
          const code = searchText.match(/\d+/)?.[0]!
          const id = await bika.api.comic.getComicIdByPicId(code, signal)
          return [BikaPage.contentType, id, '1']
        }
      }
    ]
  },
  config: [config]
})
let initData: bika.search.Init

export type BikaPlugin = PluginExpose<() => typeof plugin>