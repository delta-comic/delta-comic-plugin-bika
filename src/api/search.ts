import type { uni } from "delta-comic-core"
import { createCommonToUniItem } from "./api/utils"
import { _bikaComic } from "./comic"
import { _bikaImage } from "./image"
import type { _bikaUser } from "./user"

export namespace _bikaSearch {

  export interface RawCollection {
    comics: _bikaComic.RawCommonComic[]
    title: string
  }
  export class Collection implements RawCollection {
    public toJSON() {
      return this.$$raw
    }
    public title: string
    public comics: _bikaComic.RawCommonComic[]
    public get $comics() {
      return this.comics.map((c) => createCommonToUniItem(c))
    }
    constructor(protected $$raw: RawCollection) {
      this.title = $$raw.title
      this.comics = $$raw.comics
    }
  }

  export interface RawCategory {
    title: string
    thumb: _bikaImage.RawImage
    isWeb: boolean
    active: boolean
    link?: string
  }
  export class Category implements RawCategory {
    public toJSON() {
      return this.$$raw
    }
    public title: string
    public thumb: _bikaImage.RawImage
    public get $thumb() {
      return new _bikaImage.Image(this.thumb)
    }
    public isWeb: boolean
    public active: boolean
    public link?: string
    constructor(protected $$raw: RawCategory) {
      this.title = $$raw.title
      this.thumb = $$raw.thumb
      this.isWeb = $$raw.isWeb
      this.active = $$raw.active
      this.link = $$raw.link
    }
  }

  export interface Init {
    apiLevel: number
    categories: { id: string, title: string }[]
    imageServer: string
    isIdUpdated: boolean
    isPunched: boolean
    latestApplication: undefined
    minApiLevel: 22
  }

  export interface Levelboard {
    users: _bikaUser.Knight[],
    comics: uni.item.Item[][]
  }
}