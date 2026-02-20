import { useNativeStore } from '@delta-comic/db'
import type { Requester } from '@delta-comic/request'
import { shallowRef } from 'vue'

import type { bika } from '@/api'
import { pluginName } from '@/symbol'
export namespace bikaStore {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz012345678'
  export const nonce = shallowRef(
    Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join('')
      .toLowerCase()
  )
  export const loginToken = shallowRef('')
  export const loginData = useNativeStore<bika.auth.LoginData>(pluginName, 'auth', {
    email: '',
    password: ''
  })

  export const api = shallowRef<Requester>()
  export const share = shallowRef<Requester>()

  export const collections = shallowRef<bika.search.Collection[]>([])
}