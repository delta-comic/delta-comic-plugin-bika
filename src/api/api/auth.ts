import { PromiseContent } from '@delta-comic/model'

import { bikaStore } from '@/store'

import type { bika as BikaType } from '..'

export namespace _bikaApiAuth {
  export const login = PromiseContent.fromAsyncFunction(
    (loginData: BikaType.auth.LoginData, signal?: AbortSignal) =>
      bikaStore.api.value!.post<{ token: string }>('/auth/sign-in', loginData, { signal })
  )

  export const signUp = PromiseContent.fromAsyncFunction(
    (data: BikaType.auth.SignupData, signal?: AbortSignal) =>
      bikaStore.api.value!.post<void>('/auth/register', data, { signal })
  )
}