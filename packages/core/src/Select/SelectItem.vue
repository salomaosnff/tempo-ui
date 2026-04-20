<script setup lang="ts">
import { computed } from "vue";
import { Primitive, type PrimitiveProps } from "../Primitive";
import { useSelect } from "./useSelect";
import { primitiveProps } from "../Primitive/usePrimitive";

export interface SelectItemProps extends PrimitiveProps {
  value: any;
  disabled?: boolean;
}

const props = withDefaults(defineProps<SelectItemProps>(), {
  as: "div",
});

const select = useSelect("SelectItem");

const isSelected = computed(() => select.isSelected(props.value));

function handleClick() {
  if (props.disabled) return;
  select.select(props.value);
}
</script>

<template>
  <Primitive
    v-bind="primitiveProps(props)"
    :data-selected="isSelected ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :aria-selected="isSelected"
    @click="handleClick"
  >
    <slot :selected="isSelected" />
  </Primitive>
</template>
