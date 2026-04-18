<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "../Primitive";

export interface ButtonContentProps extends PrimitiveProps {}

defineProps<ButtonContentProps>();
</script>

<template>
  <Primitive :as :as-child>
    <slot></slot>
  </Primitive>
</template>
