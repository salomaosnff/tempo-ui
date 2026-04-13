<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { waitEmit, type WaitableEvent } from '@/_shared/waitEmit';

import { Primitive } from '../Primitive';

import { provideButton, type ButtonProvider } from './useButton';

export interface ButtonRootProps {
  disabled?: boolean
  loading?: boolean
  onClick?: WaitableEvent<(event: MouseEvent) => Promise<1>>
}

const props = defineProps<ButtonRootProps>()

const isWaiting = shallowRef(false)

const isLoading = computed(() => props.loading || isWaiting.value)
const isDisabled = computed(() => props.disabled)

async function triggerClick(event: MouseEvent) {
  if (isLoading.value || isDisabled.value) {
    return
  }

  try {
    isWaiting.value = true
    await waitEmit(props.onClick, event)
  } finally {
    isWaiting.value = false
  }
}

const provider: ButtonProvider = provideButton({
  isLoading,
  isDisabled,
  triggerClick
})
</script>

<template>
  <Primitive as-child @click="triggerClick">
    <slot v-bind="provider"></slot>
  </Primitive>
</template>