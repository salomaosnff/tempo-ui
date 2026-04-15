<script setup lang="ts">
import { onMounted } from 'vue'
import { usePagePager } from '../src/_shared/pager/usePagePager'
import { useInfinitePager } from '../src/_shared/pager/useInfinitePager'
import type { PagePagerParams, PagePagerResponse } from '../src/_shared/pager/usePagePager'

// ── Fake data ──────────────────────────────────────────────────
interface User {
  id: number
  name: string
  email: string
  avatar: string
  role: string
}

const TOTAL_USERS = 2000
const PAGE_SIZE = 20
const TOTAL_PAGES = Math.ceil(TOTAL_USERS / PAGE_SIZE)

const ALL_USERS: User[] = Array.from({ length: TOTAL_USERS }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user${i + 1}`,
  role: ['Engineer', 'Designer', 'Manager', 'Analyst', 'DevOps'][i % 5],
}))

// ── Fake API that simulates page-based pagination ──────────
async function fetchUsers(params: PagePagerParams): Promise<PagePagerResponse<User>> {
  await new Promise((r) => setTimeout(r, 600))

  const page = params.page ?? 1
  const size = params.page_size ?? PAGE_SIZE
  const offset = (page - 1) * size
  const items = ALL_USERS.slice(offset, offset + size)

  return {
    items,
    total_pages: TOTAL_PAGES,
  }
}

// ── Pager setup ──────────────────────────────────────────────

const { pager } = useInfinitePager(usePagePager(fetchUsers))
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">∞</span>
          <h1>Infinite Pager</h1>
        </div>
        <p class="subtitle">useInfinitePager + useCursorPager demo</p>
      </div>

      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{{ pager.items.value.length }}</span>
          <span class="stat-label">Loaded</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">{{ TOTAL_USERS }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value status-badge" :class="pager.status.value">
            {{ pager.status.value }}
          </span>
          <span class="stat-label">Status</span>
        </div>
      </div>
    </header>

    <!-- Scrollable area -->
    <div ref="scrollContainer" class="scroll-area">
      <div class="grid">
        <div v-for="user in pager.items.value" :key="user.id" class="card">
          <div class="card-header">
            <img :src="user.avatar" :alt="user.name" class="avatar" />
            <span class="card-id">#{{ user.id }}</span>
          </div>
          <div class="card-body">
            <h3 class="card-name">{{ user.name }}</h3>
            <span class="card-role">{{ user.role }}</span>
            <span class="card-email">{{ user.email }}</span>
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="pager.status.value === 'pending'" class="loader">
        <div class="spinner"></div>
        <span>Loading more users…</span>
      </div>

      <!-- End state -->
      <div v-else-if="!pager.hasNext.value && pager.items.value.length > 0" class="end-message">
        <span class="end-icon">✓</span>
        All {{ TOTAL_USERS }} users loaded
      </div>
    </div>

    <!-- Progress bar -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${(pager.items.value.length / TOTAL_USERS) * 100}%` }"></div>
    </div>
  </div>
</template>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0b0f1a;
  color: #e2e8f0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

/* ── Header ─────────────────────────────────────────── */
.header {
  flex-shrink: 0;
  padding: 1.5rem 2rem 1rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 26, 0.9) 100%);
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(12px);
}

.header-content {
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-icon {
  font-size: 1.6rem;
  background: linear-gradient(135deg, #818cf8, #a78bfa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.logo h1 {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.8rem;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.01em;
}

/* ── Stats ──────────────────────────────────────────── */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.65rem 1rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #c7d2fe;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 0.65rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(99, 102, 241, 0.15);
}

.status-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
}

.status-badge.idle {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.status-badge.pending {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  animation: pulse-status 1.2s ease-in-out infinite;
}

.status-badge.done {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}

.status-badge.error {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

@keyframes pulse-status {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* ── Scroll Area ────────────────────────────────────── */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem 2rem;
  scroll-behavior: smooth;
}

.scroll-area::-webkit-scrollbar {
  width: 6px;
}

.scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-area::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.25);
  border-radius: 999px;
}

/* ── Grid ───────────────────────────────────────────── */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

/* ── Card ───────────────────────────────────────────── */
.card {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.25s ease;
  animation: card-enter 0.35s ease both;
}

.card:hover {
  border-color: rgba(129, 140, 248, 0.35);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12);
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem 0.6rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.12);
  border: 1.5px solid rgba(129, 140, 248, 0.2);
}

.card-id {
  font-size: 0.7rem;
  color: #475569;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.card-body {
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.card-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e2e8f0;
  letter-spacing: -0.01em;
}

.card-role {
  font-size: 0.75rem;
  color: #818cf8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-email {
  font-size: 0.75rem;
  color: #64748b;
}

/* ── Loader ─────────────────────────────────────────── */
.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #818cf8;
  font-size: 0.85rem;
  font-weight: 500;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(129, 140, 248, 0.2);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── End message ────────────────────────────────────── */
.end-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  color: #34d399;
  font-size: 0.85rem;
  font-weight: 600;
  animation: fade-in 0.4s ease;
}

.end-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(52, 211, 153, 0.15);
  border-radius: 50%;
  font-size: 0.7rem;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Progress Bar ───────────────────────────────────── */
.progress-track {
  flex-shrink: 0;
  height: 3px;
  background: rgba(30, 41, 59, 0.8);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #818cf8, #a78bfa);
  border-radius: 0 2px 2px 0;
  transition: width 0.4s ease;
}
</style>
