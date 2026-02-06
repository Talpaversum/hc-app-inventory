import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-plugin",
    emptyOutDir: true,
    lib: {
      entry: "src/plugin.tsx",
      formats: ["es"],
      fileName: () => "plugin.js",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
