<script setup lang="ts">
import { computed } from "vue";
import { Primitive, type PrimitiveProps } from "../Primitive";
import { useSelect } from "./useSelect";
import { primitiveProps } from "../Primitive/usePrimitive";

export interface SelectValueProps extends PrimitiveProps {
  placeholder?: string;
}

const props = withDefaults(defineProps<SelectValueProps>(), {
  as: "span",
});

const select = useSelect("SelectValue");

const displayValue = computed(() => {
  const val = select.modelValue.value;
  if (select.multiple.value && Array.isArray(val)) {
    return val.length > 0 ? val.join(", ") : props.placeholder;
  }
  return val != null && val !== "" ? String(val) : props.placeholder;
});
</script>

<template>
  <Primitive v-bind="primitiveProps(props)">
    <slot :value="select.modelValue.value">
      {{ displayValue }}
    </slot>
  </Primitive>
</template>
