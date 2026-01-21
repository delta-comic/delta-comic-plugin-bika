const base = [
  {
    "url": "go2778.com",
    "basePart": "picaapi",
    "recommendPart": "recommend",
  },
  {
    "url": "acbbb.com",
    "basePart": "picaapi",
    "recommendPart": "recommend",
  }
]
export const api = base.map(v => `https://${v.basePart}.${v.url}`)

export const share = base.map(v => `https://${v.recommendPart}.${v.url}`)

export const image = [
  "https://s3.go2778.com/static",
  "https://storage-b.safedataplj.com/static",
  "https://s3.picacomic.com/static",
  "https://storage.diwodiwo.xyz/static"
]