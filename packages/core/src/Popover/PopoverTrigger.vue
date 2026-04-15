<script setup lang="ts">
import { computed, reactive } from 'vue';
import { Primitive, type PrimitiveProps } from '../Primitive'
import { usePopover } from './usePopover'
import { primitiveProps } from '@/Primitive/usePrimitive';

export interface PopoverTriggerProps extends PrimitiveProps { }

const props = withDefaults(defineProps<PopoverTriggerProps>(), {
  as: 'button',
})

const popover = usePopover()
</script>

<template>
  <Primitive v-bind="primitiveProps(props)" :popovertarget="popover.contentId" :style="{
    anchorName: popover.initialAnchorName
  }">
    <slot />
  </Primitive>
</template>
