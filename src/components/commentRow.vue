<script setup lang="ts">
import { computed } from 'vue'
import { bika } from '@/api'
import type { uni } from '@delta-comic/model'
import { require } from '@delta-comic/plugin'
import { LayoutPlugin } from '@/depend'

const $props = defineProps<{
  comment: uni.comment.Comment
  item: uni.item.Item
  parentComment?: uni.comment.Comment
}>()
const raw = computed<bika.comment.RawBaseComment>(() => $props.comment.$$meta!.raw)
const rawUploader = computed<bika.user.RawUser | undefined>(
  () => (<bika.comic.RawFullComic>$props.item.$$meta.comic)?._creator
)
const $emit = defineEmits<{ click: [c: uni.comment.Comment]; clickUser: [u: uni.user.User] }>()
defineSlots<{ default(): void }>()

const isUploader = computed(
  () => raw.value._user && rawUploader.value && rawUploader.value._id == raw.value._user._id
)

const {
  component: {
    comment: { CommentRow }
  }
} = require(LayoutPlugin)
</script>

<template>
  <CommentRow
    :item
    @clickUser="$emit('clickUser', $event)"
    @click="$emit('click', $event)"
    :comment
    :parentComment
    :usernameHighlight="isUploader"
  >
    <template #userExtra>
      <span class="mr-1 text-[11px] font-normal text-(--nui-primary-color)"
        >Lv{{ raw._user?.level }}</span
      >
      <span
        class="-translate-y-0.5 rounded bg-(--nui-primary-color) px-0.5 py-0.5 text-[9px] text-white"
        v-if="isUploader"
        >UP</span
      >
    </template>
  </CommentRow>
</template>