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
  build: {
    rollupOptions: {
      output: {
        /*
         * Bibliotecas base em arquivos próprios: mudam pouco e ficam em cache
         * entre deploys. Do MUI entra só o motor de estilos (system, emotion,
         * utils), usado por toda tela; os componentes ficam com as telas que
         * os usam, para o admin não pesar no carregamento inicial do professor.
         */
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id))
            return "vendor-react";
          if (/[\\/]node_modules[\\/](@mui[\\/](system|utils|private-theming|styled-engine)|@emotion)[\\/]/.test(id))
            return "vendor-mui";
          return undefined;
        },
      },
    },
  },
}));
