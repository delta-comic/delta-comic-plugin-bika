import { config } from "@/config"
import { bikaStore } from "@/store"
import { enc, HmacSHA256 } from "crypto-js"
import { Store } from "delta-comic-core"
import { isEmpty } from "es-toolkit/compat"

export const getBikaApiHeaders = (pathname: string, method: string) => {
  type Headers = [name: string, value: string][]
  pathname = pathname.substring(1)
  const requestTime = (new Date().getTime() / 1000).toFixed(0)
  const rawSignature = `${pathname}${requestTime}${bikaStore.nonce.value}${method}C69BAF41DA5ABD1FFEDC6D2FEA56B`.toLowerCase()
  const headers: Headers = [
    ['app-channel', '1'],
    ['app-uuid', 'webUUID'],
    ['accept', 'application/vnd.picacomic.com.v1+json'],
    ['app-platform', 'android'],
    ['Content-Type', 'application/json; charset=UTF-8'],
    ['time', requestTime],
    ['nonce', bikaStore.nonce.value],
    ['image-quality', Store.useConfig().$load(config).value.imageQuality],
    ['signature', HmacSHA256(rawSignature, '~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn').toString(enc.Hex)],
  ]
  if (!isEmpty(bikaStore.loginToken.value)) headers.push(['authorization', bikaStore.loginToken.value])
  return headers
}