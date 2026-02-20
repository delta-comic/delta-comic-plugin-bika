<script setup lang="ts">
import { bikaStore } from '@/store'
import { PromiseContent } from '@delta-comic/model'
import type { Search } from '@delta-comic/plugin'
import { MD5 } from 'crypto-js'
import { computed } from 'vue'

const $props = defineProps<{ isActive: boolean; tabbar: Search.Tabbar }>()
const dataSource = computed(() =>
  PromiseContent.resolve(
    bikaStore.collections.value.find(v => MD5(v.title).toString() == $props.tabbar.id)?.$comics ??
      []
  )
)
</script>

<template>
  <DcWaterfall :source="{ data: dataSource, isEnd: true }" v-slot="{ item }" ref="list">
    <Card :item free-height type="small" />
  </DcWaterfall>
</template>