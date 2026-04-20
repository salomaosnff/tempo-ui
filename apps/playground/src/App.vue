<script setup lang="ts">
import { ref } from "vue";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  usePagePager,
  PagerState,
} from "@tempoui/core";

type MockItem = { id: number; label: string; value: string };

// Mock API
const mockApi = async (params: { page?: number; page_size?: number } = {}) => {
  const page = params.page || 1;
  const pageSize = params.page_size || 20;

  return new Promise<{ items: MockItem[]; total_pages: number }>((resolve) => {
    setTimeout(() => {
      const items = Array.from({ length: pageSize }).map((_, i) => {
        const id = (page - 1) * pageSize + i + 1;
        return {
          id,
          label: `Item ${id}`,
          value: `item_${id}`,
        };
      });

      resolve({
        items,
        total_pages: 5,
      });
    }, 1000);
  });
};

const pager = usePagePager(mockApi);
const singleSelection = ref();
const multiSelection = ref([]);
</script>

<template>
  <div class="playground">
    <h1>Select Component Example</h1>

    <div class="example">
      <h2>Single Selection (No Pager)</h2>
      <SelectRoot v-model="singleSelection">
        <SelectTrigger class="trigger">
          <SelectValue placeholder="Selecione um item..." />
        </SelectTrigger>
        <SelectContent class="content">
          <SelectGroup>
            <SelectLabel class="label">Frutas</SelectLabel>
            <SelectItem value="apple" class="item">Maçã</SelectItem>
            <SelectItem value="banana" class="item">Banana</SelectItem>
            <SelectItem value="orange" class="item">Laranja</SelectItem>
          </SelectGroup>
        </SelectContent>
      </SelectRoot>
      <p>Selecionado: {{ singleSelection }}</p>
    </div>

    <div class="example">
      <h2>Multiple Selection with Infinite Scroll</h2>
      <SelectRoot v-model="multiSelection" multiple :items="pager">
        <SelectTrigger class="trigger">
          <SelectValue placeholder="Selecione múltiplos itens..." />
        </SelectTrigger>
        <SelectContent class="content scrollable">
          <SelectGroup>
            <SelectLabel class="label">Itens Carregados Dinamicamente</SelectLabel>
            <SelectItem
              v-for="item in pager.items.value"
              :key="item.id"
              :value="item.value"
              class="item"
            >
              {{ item.label }}
            </SelectItem>
            <div v-if="pager.status.value === PagerState.PENDING" class="loading">
              Carregando mais itens...
            </div>
          </SelectGroup>
        </SelectContent>
      </SelectRoot>
      <p>Selecionado: {{ multiSelection }}</p>
    </div>
  </div>
</template>

<style scoped>
.playground {
  padding: 2rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: #fff;
  background: #121212;
  min-height: 100vh;
}

.example {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #1e1e1e;
  border-radius: 8px;
}

.trigger {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: #2a2a2a;
  border: 1px solid #333;
  color: white;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.content {
  margin-top: 0.5rem;
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 0.5rem;
}

.scrollable {
  max-height: 200px;
  overflow-y: auto;
}

.label {
  font-size: 0.8rem;
  color: #888;
  padding: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.item {
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.item:hover {
  background: #3a3a3a;
}

.item[data-selected] {
  background: #4a4a4a;
  font-weight: bold;
}

.loading {
  padding: 0.5rem;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
}
</style>
