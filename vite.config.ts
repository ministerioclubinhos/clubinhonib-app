/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => ({
  plugins: [react(), svgr()],
  envDir: "env",
  resolve: {
    alias: {
      "@": "/src",
      components: "/src/components",
      pages: "/src/pages",
      store: "/src/store",
      config: "/src/config",
      utils: "/src/utils",
      common: "/src/common"
    }
  },
  define: { "process.env": {} },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    css: false,
    // O pacote de seletores de data importa `@mui/material/useMediaQuery` como
    // diretório, o que o Node não resolve em ESM. Transformá-lo aqui faz a
    // resolução passar pelo Vite, como acontece no navegador.
    server: { deps: { inline: [/@mui\/x-date-pickers/] } }
  }
}));
