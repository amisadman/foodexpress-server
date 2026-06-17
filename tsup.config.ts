import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/server.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "api",
  splitting: false,
  clean: true,
  external: ["pg-native"],
  outExtension: () => ({ js: ".mjs" }),
});