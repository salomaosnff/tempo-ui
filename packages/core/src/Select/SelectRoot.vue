<script setup lang="ts">
import { ref, computed, toRef } from "vue";
import { provideSelect, type SelectContext } from "./useSelect";
import type { Pager } from "../composables/pager/pager";
import { PopoverRoot } from "../Popover";

export interface SelectRootProps {
  multiple?: boolean;
  items?: Pager<any> | any[];
}

const props = defineProps<SelectRootProps>();
const modelValue = defineModel<any | any[]>();
const isOpen = ref(false);

const multiple = computed(() => props.multiple ?? false);

function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

function toggle() {
  isOpen.value = !isOpen.value;
}

function isSelected(value: any) {
  if (multiple.value) {
    return Array.isArray(modelValue.value) && modelValue.value.includes(value);
  }
  return modelValue.value === value;
}

function select(value: any) {
  if (multiple.value) {
    const current = Array.isArray(modelValue.value) ? [...modelValue.value] : [];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    modelValue.value = current;
  } else {
    modelValue.value = value;
    close();
  }
}

const provider: SelectContext = provideSelect({
  isOpen,
  modelValue,
  multiple,
  items: toRef(props, "items"),
  open,
  close,
  toggle,
  select,
  isSelected,
});
</script>

<template>
  <PopoverRoot v-model="isOpen">
    <slot v-bind="provider" />
  </PopoverRoot>
</template>
