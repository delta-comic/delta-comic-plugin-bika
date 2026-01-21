import { Store } from 'delta-comic-core'
import { pluginName } from './symbol'
import type { bika } from './api'
export const config = new Store.ConfigPointer(pluginName, {
  imageQuality: {
    type: 'radio',
    comp: 'radio',
    defaultValue: <bika.ImageQuality>'original',
    info: '画质',
    selects: [{
      label: '大清',
      value: <bika.ImageQuality>'original',
    }, {
      label: '超清',
      value: <bika.ImageQuality>'high',
    }, {
      label: '高清',
      value: <bika.ImageQuality>'medium',
    }, {
      label: '标清',
      value: <bika.ImageQuality>'low',
    }]
  }
})