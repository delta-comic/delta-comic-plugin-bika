import { Utils } from 'delta-comic-core'
import type { bika as BikaType } from '..'
import { bikaStream, createLessToUniItem, createStructFromResponseStream } from "./utils"
import { bikaStore } from "@/store"
import { _bikaUser } from '../user'

export namespace _bikaApiUser {
  const { PromiseContent } = Utils.data
  export const editSlogan = PromiseContent.fromAsyncFunction((slogan: string, signal?: AbortSignal) => bikaStore.api.value!.put('/users/profile', { slogan }, { signal }))

  export const getProfile = PromiseContent.fromAsyncFunction(async (uid?: string, signal?: AbortSignal) => {
    if (!uid) return new _bikaUser.UserMe((await bikaStore.api.value!.get<{ user: BikaType.user.RawUserMe }>('/users/profile', { signal })).user)
    return new _bikaUser.UserMe((await bikaStore.api.value!.get<{ user: BikaType.user.RawUserMe }>(`/users/${uid}/profile`, { signal })).user)
  })

  export const punch = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => bikaStore.api.value!.post('/users/punch-in', undefined, { signal }))

  export const editAvatar = PromiseContent.fromAsyncFunction((imageDataUrl: string, signal?: AbortSignal) => bikaStore.api.value!.put('/users/avatar', {
    avatar: imageDataUrl
  }, { signal }))

  export const getFavouriteComic = PromiseContent.fromAsyncFunction((page: number, signal?: AbortSignal) => createStructFromResponseStream(bikaStore.api.value!.get<{ comics: BikaType.api.pica.RawStream<BikaType.comic.RawLessComic> }>(`/users/favourite?page=${page}`, { signal }), createLessToUniItem))

  export const createFavouriteComicStream = () => bikaStream((page, signal) => getFavouriteComic(page, signal))

}