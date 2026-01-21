import { useLocalStorage } from "@vueuse/core"
import { shallowRef } from "vue"
import { Utils } from 'delta-comic-core'
import type { bika } from "@/api"
export namespace bikaStore {
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
  export const nonce = shallowRef(
    Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('').toLowerCase()
  )
  export const loginToken = shallowRef('')
  export const loginData = useLocalStorage<bika.auth.LoginData>('bika.kv', { email: '', password: '' })

  export const api = shallowRef<Utils.request.Requester>()
  export const share = shallowRef<Utils.request.Requester>()

  export const collections = shallowRef<bika.search.Collection[]>([])
}