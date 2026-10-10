import { defineConfig } from "vite";

// L'interfaccia del plugin e' servita dal motore sotto /plugins/cuelith.richtext/<versione>/ui/:
// percorsi relativi, niente file incorporati come data: (CSP del motore).
export default defineConfig({
  base: "./",
  root: "src/ui",
  build: {
    outDir: "../../dist/ui",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    sourcemap: false,
    modulePreload: { polyfill: false },
  },
});
