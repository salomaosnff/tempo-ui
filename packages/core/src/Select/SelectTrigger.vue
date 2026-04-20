<script setup lang="ts">
import { PopoverTrigger } from "../Popover";
import { useSelect } from "./useSelect";
import type { PrimitiveProps } from "../Primitive";

export interface SelectTriggerProps extends PrimitiveProps {}

const props = withDefaults(defineProps<SelectTriggerProps>(), {
  as: "button",
});

const select = useSelect("SelectTrigger");
</script>

<template>
  <PopoverTrigger v-bind="props" :aria-expanded="select.isOpen.value">
    <slot />
  </PopoverTrigger>
</template>
