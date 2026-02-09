<script setup lang="ts">
import { watch } from 'vue'
import { BikaPage } from '@/api/page'
import { requireDepend, Store, Utils } from 'delta-comic-core'
import { bika } from '@/api'
import { config } from '@/config'
import { LayoutPlugin } from '@/depend'
const { view } = requireDepend(LayoutPlugin)
const $props = defineProps<{ page: BikaPage }>()
const isFullScreen = defineModel<boolean>('isFullScreen', { required: true })
const imageQualityMap: Record<bika.ImageQuality, string> = {
  low: '标清',
  medium: '高清',
  high: '超清',
  original: '大清'
}
const bikaConfig = Store.useConfig().$load(config)
const smartAbortReloadAbortSignal = new Utils.request.SmartAbortController()
watch(
  () => bikaConfig.value.imageQuality,
  () => {
    smartAbortReloadAbortSignal.abort()
    $props.page.reloadAll(smartAbortReloadAbortSignal.signal)
  }
)
</script>

<template>
  <view.Image :page v-model:isFullScreen="isFullScreen">
    <template #bottomBar>
      <VanPopover
        @select="q => (bikaConfig.imageQuality = q.label)"
        placement="top-end"
        theme="dark"
        :actions="
          Object.entries(imageQualityMap).map(v => ({
            text: imageQualityMap[<bika.ImageQuality>v[0]],
            label: v[0]
          }))
        "
        class="overflow-hidden! bg-transparent! **:overflow-hidden!"
      >
        <template #reference>
          <NButton text color="#fff">
            {{ imageQualityMap[bikaConfig.imageQuality as bika.ImageQuality] }}
          </NButton>
        </template>
      </VanPopover>
    </template>
  </view.Image>
</template>