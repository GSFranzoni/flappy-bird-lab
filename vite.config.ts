import path from "node:path";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const getBase = () => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];

  if (process.env.VITE_BASE_PATH) {
    return `${process.env.VITE_BASE_PATH.replace(/\/+$/, "")}/`;
  }

  if (process.env.GITHUB_ACTIONS && repositoryName) {
    return `/${repositoryName}/`;
  }

  return "/";
};

// https://vite.dev/config/
export default defineConfig({
  base: getBase(),
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
