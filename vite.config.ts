import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, existsSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-extension-html",
      closeBundle() {
        // Ensure popup.html and blocked.html exist at the root of dist/
        const srcPopup = resolve(__dirname, "dist/src/default/popup.html");
        const destPopup = resolve(__dirname, "dist/popup.html");
        if (existsSync(srcPopup)) {
          copyFileSync(srcPopup, destPopup);
        }

        const srcBlocked = resolve(__dirname, "dist/src/default/blocked.html");
        const destBlocked = resolve(__dirname, "dist/blocked.html");
        if (existsSync(srcBlocked)) {
          copyFileSync(srcBlocked, destBlocked);
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/default/popup.html"),
        blocked: resolve(__dirname, "src/default/blocked.html"),
        serviceWorker: resolve(__dirname, "src/background/serviceWorker.ts"),
        contentScript: resolve(__dirname, "src/entries/content/main.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
