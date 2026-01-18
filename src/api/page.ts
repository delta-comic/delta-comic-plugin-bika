import { pluginName } from "@/symbol"
import View from "@/components/view.vue"
import { uni, Utils } from "delta-comic-core"
import { bika } from "."

export class BikaPage extends uni.content.ContentImagePage {
  public static contentType = uni.content.ContentPage.contentPage.toString([
    pluginName,
    'default'
  ])
  public override plugin = pluginName
  public override contentType = uni.content.ContentPage.contentPage.toJSON(BikaPage.contentType)
  public override loadAll(signal?: AbortSignal) {
    return Promise.all([
      this.eps.content.isLoading.value || this.eps.content.loadPromise(bika.api.comic.getComicEps(this.id, signal)),
      this.detail.content.isLoading.value || this.detail.content.loadPromise(bika.api.comic.getComicInfo(this.id, signal).then(v => {
        if (!v) {
          throw Utils.message.createDialog({
            type: 'error',
            content: `${pluginName}漫画id:${this.id}审核中`,
            positiveText: '确定'
          })
        } else
          return v
      })),
      this.pid.content.isLoading.value || this.pid.content.loadPromise(bika.api.comic.getComicPicId(this.id, signal).then(v => String(v))),
      this.recommends.content.isLoading.value || this.recommends.content.loadPromise(bika.api.comic.getRecommendComics(this.id, signal)),
      this.images.content.isLoading.value || this.images.content.loadPromise(bika.api.comic.getComicPages(this.id, Number(this.ep), signal).then(v => Promise.all(v.map(v => v.$media.toUni())))),
    ])
  }
  public override comments = bika.api.comment.createCommentsStream(this.id, 'comics')
  public override reloadAll(signal?: AbortSignal) {
    this.eps.reset(true)
    this.detail.reset(true)
    this.pid.reset(true)
    this.recommends.reset(true)
    this.images.reset(true)
    return this.loadAll(signal)
  }
  public override loadAllOffline(_save: any): Promise<never> {
    throw new Error("Method not implemented.")
  }
  public override exportOffline(): Promise<never> {
    throw new Error("Method not implemented.")
  }
  public override ViewComp = View
  constructor(preload: uni.content.PreloadValue, id: string, ep: string) {
    super(preload, id, ep)
  }
}