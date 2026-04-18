<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "../Primitive";
import { useButton } from "./useButton";

export interface ButtonAreaProps extends PrimitiveProps {}

withDefaults(defineProps<ButtonAreaProps>(), {
  as: "button",
});

const { isDisabled, triggerClick } = useButton();
</script>

<template>
  <Primitive :as :as-child :disabled="isDisabled" @click="triggerClick">
    <slot></slot>
  </Primitive>
</template>
