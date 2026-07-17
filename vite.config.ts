import { defineConfig } from "vite";

// GitHub Pages serves project sites under /<repo-name>/; Cloudflare Pages
// serves at the domain root. BASE_PATH is set by the CI workflow.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
});
