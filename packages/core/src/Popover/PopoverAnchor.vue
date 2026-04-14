<script setup lang="ts">
import { onBeforeUnmount, watch, onMounted } from 'vue'
import { usePopover } from './usePopover'
import { Primitive, type PrimitiveProps } from '../Primitive'

export interface PopoverAnchorProps extends PrimitiveProps {
  /**
   * The target element to anchor the popover to.
   * Can be a CSS selector, an HTMLElement, or a Vue Ref.
   */
  to?: string | HTMLElement | null
}

const props = withDefaults(defineProps<PopoverAnchorProps>(), {
  asChild: true
})

const popover = usePopover()

let lastElement: HTMLElement | null = null
let anchorWasGenerated = false

function cleanUp() {
  if (lastElement && anchorWasGenerated) {
    lastElement.style.removeProperty('anchor-name')
    lastElement = null
  }
  anchorWasGenerated = false
  // Reset anchorName to initial when anchor is removed
  popover.anchorName = popover.initialAnchorName
}

function applyAnchor(to: string | HTMLElement | null | undefined) {
  cleanUp()
  if (!to) return

  let el: HTMLElement | null = null
  if (typeof to === 'string') {
    el = document.querySelector(to)
  } else if (to instanceof HTMLElement) {
    el = to
  }

  if (el) {
    // We create a unique name for the external anchor to avoid conflict with the trigger
    const externalName = `${popover.initialAnchorName}-external`
    el.style.setProperty('anchor-name', externalName)
    
    // Update the context so PopoverContent uses this external anchor
    popover.anchorName = externalName
    
    anchorWasGenerated = true
    lastElement = el
  }
}

watch(() => props.to, applyAnchor)
onMounted(() => applyAnchor(props.to))
onBeforeUnmount(cleanUp)
</script>

<template>
  <Primitive v-bind="props" :style="{ anchorName: popover.anchorName }">
    <slot />
  </Primitive>
</template>
