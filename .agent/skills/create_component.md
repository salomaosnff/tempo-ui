# 🛠️ Skill: Create TempoUI Component

This skill provides a systematic workflow and code templates for creating new headless components in the TempoUI library.

## 📋 Prerequisite Checklist
- **Headless**: No `<style>` blocks.
- **Atomic**: Broken down into `Root` and `Parts`.
- **Primitive**: Every part inherits from `Primitive`.
- **Context-driven**: State shared via `createContext`.

---

## 🏗️ Workflow

### 1. Initialize Directory
Create a folder in `src/` with the component name (PascalCase).
```bash
mkdir src/ComponentName
```

### 2. Define Context (`useComponent.ts`)
Define the state and methods that will be shared across parts.
```ts
// src/ComponentName/useComponentName.ts
import { createContext } from "@/_shared/createContext"
import type { ComputedRef } from "vue"

export interface ComponentNameProvider {
  // Define computed state and methods here
  modelValue: ComputedRef<any>
  updateValue(val: any): void
}

const { inject, provide } = createContext<ComponentNameProvider>('ComponentName')

export { inject as useComponentName, provide as provideComponentName }
```

### 3. Create Root Component (`ComponentNameRoot.vue`)
The Root component manages the state and provides the context. It must extend `Primitive`.
```vue
<!-- src/ComponentName/ComponentNameRoot.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Primitive, type PrimitiveProps } from '../Primitive'
import { provideComponentName, type ComponentNameProvider } from './useComponentName'

interface Props extends PrimitiveProps {
  modelValue?: any
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div'
})

const emit = defineEmits(['update:modelValue'])

const provider: ComponentNameProvider = {
  modelValue: computed(() => props.modelValue),
  updateValue: (val) => emit('update:modelValue', val)
}

provideComponentName(provider)
</script>

<template>
  <Primitive v-bind="props">
    <slot v-bind="provider" />
  </Primitive>
</template>
```

### 4. Create Functional Parts (`ComponentName[Part].vue`)
Subcomponents should use the `useComponentName` hook and `Primitive`.
```vue
<!-- src/ComponentName/ComponentNameTrigger.vue -->
<script setup lang="ts">
import { useComponentName } from './useComponentName'
import { Primitive, type PrimitiveProps } from '../Primitive'

const props = withDefaults(defineProps<PrimitiveProps>(), {
  as: 'button'
})

const { updateValue } = useComponentName()
</script>

<template>
  <Primitive v-bind="props" @click="updateValue('new-value')">
    <slot />
  </Primitive>
</template>
```

### 5. Handle Async Events
Use `WaitableEvent` for any event-like prop that needs orchestration.
```ts
import { waitEmit, type WaitableEvent } from '../_shared/waitEmit'
// ...
onSubmit: WaitableEvent<(val: any) => Promise<void>>
```

### 6. Export Everything (`index.ts`)
```ts
// src/ComponentName/index.ts
export { default as ComponentNameRoot } from './ComponentNameRoot.vue'
export { default as ComponentNameTrigger } from './ComponentNameTrigger.vue'
export * from './useComponentName'
```

---

## 🎯 Implementation Rules
1. **Never** use hardcoded colors or sizing in the core logic.
2. **Always** support `asChild`.
3. **Always** implement ARIA roles suitable for the component type.
4. If a component uses forms, ensure it integrates with `Regle` patterns if possible.
