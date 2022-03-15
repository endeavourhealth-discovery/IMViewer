import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");

export default defineConfig({
    base: "./",
    plugins: [vue()],
    resolve: {
        dedupe: ["vue"],
        alias: {'./runtimeConfig': './runtimeConfig.browser', "@": path.resolve(__dirname, "./src")}
    },
    server: {
        port: 8082
    },
    optimizeDeps: {
        exclude: [
            'im-library',
        ]
    },
    test: {
        globals: true,
        environment: "jsdom",
        environmentOptions: {
            jsdom: {
                url: 'http://localhost'
            }
        }
    },
});
