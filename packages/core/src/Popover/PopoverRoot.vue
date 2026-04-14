<script setup lang="ts">
import { reactive, shallowRef, useId, watchEffect } from 'vue'
import { providePopover, type PopoverContext } from './usePopover'

const props = defineProps<{
  anchorName?: string
}>()

// useId can return symbols like ":v0:", which might break native popovertarget in some cases.
// We clean it to be safe for DOM IDs.
const rawId = useId()
const popoverId = rawId.replace(/:/g, '')

const initialAnchorName = `--tempoui-anchor-${popoverId}`
const currentAnchorName = shallowRef(props.anchorName ?? initialAnchorName);
const isOpen = defineModel<boolean>({ default: false })

watchEffect(() => {
  currentAnchorName.value = props.anchorName ?? initialAnchorName
})

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
}

const provider: PopoverContext = providePopover(reactive({
  popoverId,
  initialAnchorName,
  anchorName: currentAnchorName,
  isOpen,
  open,
  close,
  toggle
}))
</script>

<template>
  <slot v-bind="provider" />
</template>
