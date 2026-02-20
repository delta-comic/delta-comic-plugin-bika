import { ConfigPointer } from '@delta-comic/plugin'

import type { bika } from './api'
import { pluginName } from './symbol'
export const config = new ConfigPointer(
  pluginName,
  {
    imageQuality: {
      type: 'radio',
      comp: 'radio',
      defaultValue: <bika.ImageQuality>'original',
      info: '画质',
      selects: [
        { label: '大清', value: <bika.ImageQuality>'original' },
        { label: '超清', value: <bika.ImageQuality>'high' },
        { label: '高清', value: <bika.ImageQuality>'medium' },
        { label: '标清', value: <bika.ImageQuality>'low' }
      ]
    }
  },
  '哔咔漫画'
)