import { defineConfig } from "vite";

const buildVersion = process.env.VITE_BUILD_VERSION || process.env.COMMIT_REF || `local-${Date.now()}`;

export default defineConfig({
  define: {
    __APP_BUILD_VERSION__: JSON.stringify(buildVersion),
  },
  build: {
    outDir: "dist",
  },
});
