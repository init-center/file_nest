import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { resolve } from "path";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "UploadButton",
      formats: ["es", "cjs"],
    },
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies), "preact/hooks"],
    },
  },
});
