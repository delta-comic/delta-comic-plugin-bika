import { pluginName } from "@/symbol"
import { uni } from "delta-comic-core"

export namespace _bikaImage {
  export interface RawImage {
    originalName: string
    path: string
    fileServer: string
  }
  export class Image implements RawImage {
    public static is(v: unknown): v is Image {
      return v instanceof Image
    }
    public originalName!: string
    public path!: string
    public fileServer!: string
    public width
    public height
    constructor(v: RawImage) {
      this.originalName = v.originalName
      this.path = v.path
      this.fileServer = v.fileServer
      // tobeimg/V61BoT9SkdYYl9ygwQ7O1kc71KGV5k4Opngem-Kt5x8/rs:fill:300:400:0/g:sm/aHR0cHM6Ly9zdG9yYWdlMS5waWNhY29taWMuY29tL3N0YXRpYy9hYzAzMDRlOC0wZWMxLTQwOGQtOTczOS0yNzY4ODJiOGNlMDIuanBn.jpg
      const [width, height] = (this.path.match(/(?<=rs:fill:)\d+:\d+/g)?.[0] ?? '300:400').split(':')
      this.width = Number(width)
      this.height = Number(height)
    }
    public toUni() {
      return uni.image.Image.create({
        $$plugin: pluginName,
        forkNamespace: 'default',
        path: this.path
      }, { width: this.width, height: this.height })
    }
  }
  export type Image_ = Image | string
}