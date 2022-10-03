import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");

export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    dedupe: ["vue"],
    alias: { "./runtimeConfig": "./runtimeConfig.browser", "@": path.resolve(__dirname, "./src") }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  server: {
    port: 8082,
    proxy: {
      "/imapi": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: p => p.replace(/^\/imapi/, "")
      },
      "/nodeapi": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: p => p.replace(/^\/nodeapi/, "")
      }
    }
  },
  optimizeDeps: {
    exclude: ["im-library"]
  },
  test: {
    globals: true,
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost"
      }
    },
    coverage: {
      reporter: ["text", "lcov"]
    },
    setupFiles: "./tests/setupTests.js"
  }
});
