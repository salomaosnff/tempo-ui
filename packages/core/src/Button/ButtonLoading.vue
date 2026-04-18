<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "../Primitive";

import { useButton } from "./useButton";

export interface ButtonLoadingProps extends PrimitiveProps {}

defineProps<ButtonLoadingProps>();

const { isLoading } = useButton();
</script>

<template>
  <Primitive v-if="isLoading" :as :as-child>
    <slot></slot>
  </Primitive>
</template>
