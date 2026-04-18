# 🧱 TempoUI

> **Premium Headless Component Library for Vue 3**
>
> TempoUI is a collection of high-performance, accessible, and completely unstyled components. It provides the logic, state, and accessibility foundations, leaving the styling entirely to you.

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4fc08d?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/badge/bundle--size-ultra--light-bluevignette)](https://github.com/sallon/tempoui)

---

## ✨ Features

- **🚀 Headless by Design**: No CSS, no style-opinion. Just robust logic.
- **🏗️ Atomic Architecture**: Components follow the `Root`/`Part` pattern via Context.
- **♿ Accessible**: Built-in WAI-ARIA compliance and keyboard navigation.
- **🎯 Strongly Typed**: First-class TypeScript support with precise interfaces.
- **🧬 Primitive Everywhere**: Every component supports `as` and `asChild` delegation.
- **📉 Optimized**: Zero-latency, tree-shakeable, and extremely lightweight.

---

## 📦 Installation

```bash
# pnpm
pnpm add @tempoui/core

# npm
npm install @tempoui/core

# yarn
yarn add @tempoui/core
```

---

## 🛠️ Development Standards

This section defines the architectural patterns used across TempoUI. Every contributor must follow these standards to ensure consistency and scalability.

### 1. Component Anatomy

A standard component follows this structure:

```text
src/Component/
├── ComponentRoot.vue    # Entry point, manages state/context
├── Component[Part].vue  # Functional subcomponents
├── useComponent.ts      # Context definition and hooks
└── index.ts             # Unified exports
```

### 2. The Context Pattern (Hook-based IE)

To avoid prop-drilling, we use a centralized context for each component family.

```ts
// useComponent.ts
import { createContext } from "@/_shared/createContext";

export interface ComponentProvider {
  activeId: ComputedRef<string | undefined>;
  setActive(id: string): void;
}

const { inject, provide } = createContext<ComponentProvider>("Component");

export { inject as useComponent, provide as provideComponent };
```

### 3. Primitive & `asChild`

Every component must extend `Primitive` to allow the consumer to swap the underlying element or delegate it via `asChild`.

```vue
<!-- ComponentTrigger.vue -->
<template>
  <Primitive as="button" @click="onClick">
    <slot />
  </Primitive>
</template>
```

### 4. Event Handling (Waitable Events)

TempoUI uses functional event props (e.g., `onSubmit` instead of `@submit`) to allow for `async` orchestration and side-effect management.

```ts
import { waitEmit, type WaitableEvent } from "../_shared/waitEmit";

export interface MyProps {
  onConfirm: WaitableEvent<(id: string) => Promise<void>>;
}

// In the component:
await waitEmit(props.onConfirm, "item-id");
```

### 5. Form & Validation (Regle)

TempoUI integrates with [@regle/core](https://regle.js.org/) for schema-based validation. The `FormRoot` component provides the `r$` object, and `FormField` components consume it using path strings.

- **Path Transformation**: Paths like `user.name` are automatically mapped to the Regle structure (`$fields.user.$fields.name`).
- **Array Support**: Numeric indices (`list[0]`) are mapped to `$each`.

```vue
<FormField path="user.email">
  <template #default="{ field, errors }">
    <input v-model="field.$value" />
    <span>{{ errors[0] }}</span>
  </template>
</FormField>
```

---

## 📕 Core Concepts

### `Primitive`

The building block of all components. It handles:

- **`as`**: Changes the rendered HTML element (e.g., `as="span"`).
- **`asChild`**: Delegates rendering to the first child element, merging attributes and events.

### Headless Philosophy

TempoUI components do **not** come with styles. You are responsible for providing the visual layer using CSS, Tailwind, or any other styling solution.

```vue
<template>
  <TabsRoot v-model="activeTab" class="tabs-container">
    <TabsTrigger value="tab1" class="px-4 py-2 border-b">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2" class="px-4 py-2 border-b">Tab 2</TabsTrigger>
  </TabsRoot>
</template>
```

---

## 📋 Checklist for New Components

1. [ ] **State Centralization**: Logic lives in the `Root` component.
2. [ ] **Context injection**: Parts consume state via `use[Component]`.
3. [ ] **Primitive Implementation**: All parts inherit `Primitive` props.
4. [ ] **A11y**: Proper `aria-*` attributes and roles applied.
5. [ ] **Cleanliness**: No `<style>` blocks in `.vue` files.
6. [ ] **Testing**: Verify `asChild` correctly merges props and events.

---

## 📜 License

MIT © [Salomão Neto](https://github.com/salomaosnff)
