import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "echo ok",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
});
