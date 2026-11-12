import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  // mdx-components.tsx lives at the root: leave it out and its classes only
  // work when some file under app/ happens to use the same ones
  content: ["./app/**/*.{ts,tsx}", "./mdx-components.tsx"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
