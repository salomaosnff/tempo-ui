<script setup lang="ts">
import { computed, reactive, shallowRef, useId } from "vue";
import { providePopover, type PopoverContext } from "./usePopover";

const isOpen = defineModel<boolean>({ default: false });
const contentId = shallowRef("");
const anchorName = `--${useId()}`;
const customAnchorName = shallowRef<string | null>();
const currentAnchor = computed(() => customAnchorName.value || anchorName);

function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

function toggle() {
  isOpen.value = !isOpen.value;
}

function customAnchor(anchorName?: string | null) {
  customAnchorName.value = anchorName;
}

const provider: PopoverContext = providePopover(
  reactive({
    contentId,
    isOpen,
    currentAnchor,
    initialAnchorName: anchorName,
    open,
    close,
    toggle,
    customAnchor,
  }),
);
</script>

<template>
  <slot v-bind="provider" />
</template>
