<script setup lang="ts">
import { Primitive, type PrimitiveProps } from '../Primitive'
import { usePopover } from './usePopover'

export interface PopoverTriggerProps extends PrimitiveProps { }

const props = withDefaults(defineProps<PopoverTriggerProps>(), {
  as: 'button',
})

const { popoverId, initialAnchorName } = usePopover()
</script>

<template>
  <Primitive 
    v-bind="props" 
    :popovertarget="popoverId"
    :style="{ anchorName: initialAnchorName }"
  >
    <slot />
  </Primitive>
</template>
