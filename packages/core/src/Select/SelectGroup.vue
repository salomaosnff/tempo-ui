<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "../Primitive";
import { primitiveProps } from "../Primitive/usePrimitive";

export interface SelectGroupProps extends PrimitiveProps {}

const props = withDefaults(defineProps<SelectGroupProps>(), {
  as: "div",
});
</script>

<template>
  <Primitive role="group" v-bind="primitiveProps(props)">
    <slot />
  </Primitive>
</template>
