/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#3B82F6",
          dark: "#60A5FA",
        },
        secondary: {
          light: "#6B7280",
          dark: "#9CA3AF",
        },
        background: {
          light: "#FFFFFF",
          dark: "#111827",
        },
        surface: {
          light: "#F3F4F6",
          dark: "#1F2937",
        },
        text: {
          light: "#111827",
          dark: "#F9FAFB",
        },
      },
    },
  },
  plugins: [],
};
