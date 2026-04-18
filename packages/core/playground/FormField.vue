<script setup lang="ts">
import { useFormField } from "../src";

const props = defineProps<{
  path: string;
}>();

const field = useFormField(() => props.path);
</script>

<template>
  <div v-if="field" class="field-info">
    <h3>Field: {{ path }}</h3>
    <p>Value: {{ field.$value }}</p>
    <p>Error: {{ field.$error }}</p>
    <p v-if="field.$errors.length">Errors: {{ field.$errors.join(", ") }}</p>
    <hr />
  </div>
</template>

<style scoped>
.field-info {
  padding: 1rem;
  border: 1px solid #ccc;
  margin: 1rem 0;
}
</style>
