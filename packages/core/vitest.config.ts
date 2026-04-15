import { defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    root: '.',
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
})
