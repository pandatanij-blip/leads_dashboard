import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { brand: "#0f766e", saffron: "#e8890c" } } }, plugins: [] } satisfies Config;
