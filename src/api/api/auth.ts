import type { bika as BikaType } from '..'
import { Utils } from "delta-comic-core"
import { bikaStore } from "@/store"

export namespace _bikaApiAuth {
  const { PromiseContent } = Utils.data
  export const login = PromiseContent.fromAsyncFunction((loginData: BikaType.auth.LoginData, signal?: AbortSignal) => bikaStore.api.value!.post<{ token: string }>('/auth/sign-in', loginData, { signal }))

  export const signUp = PromiseContent.fromAsyncFunction((data: BikaType.auth.SignupData, signal?: AbortSignal) => bikaStore.api.value!.post<void>('/auth/register', data, { signal }))

}