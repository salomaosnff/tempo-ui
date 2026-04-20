<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "../Primitive";
import { primitiveProps } from "../Primitive/usePrimitive";

export interface SelectLabelProps extends PrimitiveProps {}

const props = withDefaults(defineProps<SelectLabelProps>(), {
  as: "div",
});
</script>

<template>
  <Primitive role="presentation" v-bind="primitiveProps(props)">
    <slot />
  </Primitive>
</template>
