<script setup lang="ts">
import { computed, onMounted, useTemplateRef, watch, type ComponentPublicInstance } from 'vue'
import { Primitive, type PrimitiveProps } from '../Primitive'
import { usePopover } from './usePopover'

export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end' | 'out-start' | 'out-end'

export interface PopoverContentProps extends PrimitiveProps {
  /**
   * The side of the trigger to place the popover.
   * @default 'bottom'
   */
  side?: Side
  /**
   * The alignment of the popover relative to the trigger.
   * @default 'center'
   */
  justify?: Align
}

const props = withDefaults(defineProps<PopoverContentProps>(), {
  as: 'div',
  side: 'bottom',
  justify: 'center',
})

const popover = usePopover()
const popoverElement = useTemplateRef<ComponentPublicInstance | HTMLElement>('popoverElement')

// Get the actual DOM element whether it's a component or raw element
function getEl() {
  if (!popoverElement.value) return null
  return (popoverElement.value as any).$el ?? popoverElement.value
}

onMounted(() => {
  const el = getEl()
  if (el instanceof HTMLElement) {
    // Synchronize native state with Vue state
    el.addEventListener('toggle', (event: any) => {
      if (event.newState === 'open') {
        popover.open()
      } else {
        popover.close()
      }
    })
    
    // Initial sync if the popover is already open for some reason
    if (el.matches(':popover-open')) {
      popover.open()
    }
  }
})

// Control native state from Vue state
watch(() => popover.isOpen, (next) => {
  const el = getEl()
  if (el instanceof HTMLElement) {
    const isNativeOpen = el.matches(':popover-open')
    if (next && !isNativeOpen) {
      el.showPopover()
    } else if (!next && isNativeOpen) {
      el.hidePopover()
    }
  }
})

/**
 * Maps side and align props to CSS position-area values.
 */
const positionArea = computed(() => {
  const { side, justify } = props

  switch (side) {
    case 'top': switch (justify) {
      case 'start': return 'top span-right'
      case 'center': return 'top center'
      case 'end': return 'top span-left'
      case 'out-start': return 'top left'
      case 'out-end': return 'top right'
    }
    case 'right': switch (justify) {
      case 'start': return 'right span-bottom'
      case 'center': return 'right center'
      case 'end': return 'right span-top'
      case 'out-start': return 'right top'
      case 'out-end': return 'right bottom'
    }
    case 'bottom': switch (justify) {
      case 'start': return 'bottom span-right'
      case 'center': return 'bottom center'
      case 'end': return 'bottom span-left'
      case 'out-start': return 'bottom left'
      case 'out-end': return 'bottom right'
    }
    case 'left': switch (justify) {
      case 'start': return 'left span-bottom'
      case 'center': return 'left center'
      case 'end': return 'left span-top'
      case 'out-start': return 'left top'
      case 'out-end': return 'left bottom'
    }
  }
})
</script>

<template>
  <Primitive 
    ref="popoverElement" 
    v-bind="props" 
    :id="popover.popoverId" 
    popover="auto" 
    class="tempoui-popover-content"
    :style="{
      positionAnchor: popover.anchorName,
    }"
  >
    <slot :popoverId="popover.popoverId" v-bind="popover" />
  </Primitive>
</template>

<style scoped>
.tempoui-popover-content {
  /* Reset defaults */
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  overflow: visible;
  width: max-content;

  /* Fallback for browsers without Anchor Positioning */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Chrome 125+ Anchor Positioning */
@supports (position-area: top) {
  .tempoui-popover-content {
    position: absolute;
    inset: auto;
    transform: none;
    position-area: v-bind(positionArea);
  }
}
</style>
