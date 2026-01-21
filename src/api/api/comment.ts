import { Utils } from 'delta-comic-core'
import type { bika as BikaType } from '..'
import { bikaStream, createClassFromResponseStream } from "./utils"
import { bikaStore } from "@/store"
import { _bikaComment } from '../comment'

export namespace _bikaApiComment {
  const { PromiseContent } = Utils.data
  export const likeComment = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => (await bikaStore.api.value!.post<{ action: 'like' | 'unlike' }>(`/comments/${id}/like`, {}, { signal })).action)
  export const reportComment = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => bikaStore.api.value!.post<never>(`/comments/${id}/report`, {}, { signal }))
  export const sendComment = PromiseContent.fromAsyncFunction((id: string, content: string, signal?: AbortSignal) => bikaStore.api.value!.post<never>(`/comics/${id}/comments`, { content }, { signal }))
  export const sendChildComment = PromiseContent.fromAsyncFunction((id: string, content: string, signal?: AbortSignal) => bikaStore.api.value!.post<never>(`/comments/${id}`, { content }, { signal }))

  export const getComments = PromiseContent.fromAsyncFunction(async (from: 'games' | 'comics', sourceId: string, page: number, signal?: AbortSignal) => {
    const { comments, topComments } = (await bikaStore.api.value!.get<{
      comments: BikaType.api.pica.RawStream<BikaType.comment.RawComment>
      topComments: BikaType.comment.RawComment[]
    }>(`/${from}/${sourceId}/comments?page=${page}`, { signal }))
    if (page === 1) comments.docs.unshift(...topComments)
    const newComments: BikaType.api.pica.RawStream<BikaType.comment.BikaComment> = {
      ...comments,
      docs: comments.docs.map(c => new _bikaComment.BikaComment(c))
    }
    return newComments
  })

  export const createCommentsStream = (sourceId: string, from: 'games' | 'comics' = 'comics') => bikaStream((page, signal) => getComments(from, sourceId, page, signal))


  export const getChildComments = PromiseContent.fromAsyncFunction((parentId: string, page: number, signal?: AbortSignal) => createClassFromResponseStream(bikaStore.api.value!.get<{ comments: BikaType.api.pica.RawStream<BikaType.comment.RawChildComment> }>(`/comments/${parentId}/childrens?page=${page}`, { signal }), _bikaComment.BikaComment, 'comments'))
  export const createChildCommentsStream = (parentId: string) => bikaStream((page, signal) => getChildComments(parentId, page, signal))

  export const getMyComment = PromiseContent.fromAsyncFunction((page: number, signal?: AbortSignal) => createClassFromResponseStream(bikaStore.api.value!.get<{ comments: BikaType.api.pica.RawStream<BikaType.comment.RawMyComment> }>(`/users/my-comments?page=${page}`, { signal }), _bikaComment.BikaComment, 'comments'))
  export const createMyCommentsStream = () => bikaStream((page, signal) => getMyComment(page, signal))
}