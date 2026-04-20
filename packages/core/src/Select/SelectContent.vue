<script setup lang="ts">
import { useTemplateRef, watch, type ComponentPublicInstance } from "vue";
import { PopoverContent } from "../Popover";
import { useSelect } from "./useSelect";
import { useInfinitePager } from "../composables/infinite-scroll/useInfinitePager";
import { isPager } from "../composables/pager/pager";
import type { PrimitiveProps } from "../Primitive";

export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end" | "out-start" | "out-end";

export interface SelectContentProps extends PrimitiveProps {
  id?: string;
  side?: Side;
  justify?: Align;
  anchorElement?: HTMLElement | string;
  popover?: "auto" | "hint" | "manual";
}

const props = withDefaults(defineProps<SelectContentProps>(), {
  as: "div",
  side: "bottom",
  justify: "center",
  popover: "auto",
});

const select = useSelect("SelectContent");
const contentRef = useTemplateRef<ComponentPublicInstance | HTMLElement>("contentRef");

function getEl() {
  if (!contentRef.value) return null;
  return (contentRef.value as any).$el ?? contentRef.value;
}

watch(
  () => getEl(),
  (el) => {
    if (el && isPager(select.items?.value)) {
      useInfinitePager(select.items.value, el, {
        distance: 10,
      });
    }
  },
  { immediate: true },
);
</script>

<template>
  <PopoverContent ref="contentRef" v-bind="props">
    <slot />
  </PopoverContent>
</template>
