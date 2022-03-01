/// <reference types="vitest" />
/// <reference types="vitest/globals" />

import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");
import { esbuildCommonjs } from "@originjs/vite-plugin-commonjs";

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildCommonjs(["google-palette"])]
    }
  },
  resolve: {
    dedupe: ["vue"],
    alias: { "@": path.resolve(__dirname, "./src"), "./runtimeConfig": "./runtimeConfig.browser" }
  },
  tests: {
    globals: true,
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "tests/setupTests.js")]
  }
});
