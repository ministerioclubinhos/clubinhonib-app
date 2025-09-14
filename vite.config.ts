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
  define: { "process.env": {} }
}));
