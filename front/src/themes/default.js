import { createThemes } from "tw-colors";
import plugin from "tailwindcss/plugin";

// Modern clean colors
const colorPaper = "#F8FAFC"; // Very light blue-gray for main background
const colorSepia = "#F1F5F9"; // Light cool gray for secondary elements
const colorInk = "#1A1F36"; // Deep blue-gray for text
const colorAccent = "#3B82F6"; // Modern blue for accents
const colorParchment = "#FFFFFF"; // Pure white for cards
const colorBorder = "#E2E8F0"; // Light gray for borders

// Dark mode colors
const colorDarkBg = "#0F172A"; // Deep blue-gray background
const colorDarkCard = "#1E293B"; // Slightly lighter blue-gray for cards
const colorDarkText = "#F8FAFC"; // Cool white for text
const colorDarkMuted = "#94A3B8"; // Cool gray for muted text
const colorDarkBorder = "#334155"; // Blue-gray for borders
const colorDarkAccent = "#60A5FA"; // Bright blue for accents

// Light mode colors
const colorMuted = "#64748B"; // Cool gray for muted text (light mode)

/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  theme: {
    fontFamily: {
      sans: [
        "Inter",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ],
      display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    createThemes(
      {
        light: {
          primary: colorAccent,
          secondary: colorParchment,
          tertiary: colorSepia,
          neutral: colorInk,
          info: colorMuted,
          beige: colorParchment,
          gray: colorPaper,
          brand: colorAccent,
          background: colorPaper,
          border: colorBorder,
          // states:
          "s-success": colorAccent,
          "s-error": colorAccent,
          "s-warning": colorAccent,
          "s-info": colorMuted,
          "s-info-1": colorMuted,
          // components:
          "c-default": colorInk,
          "c-hover": colorInk,
          "c-pressed": colorMuted,
          "c-disabled-1": colorMuted,
          "c-disabled-2": colorParchment,
          "c-error": colorAccent,
          // icons:
          "i-primary": colorMuted,
          "i-secondary": colorParchment,
          "i-tertiary": colorInk,
          // fonts:
          "f-primary": colorInk,
          "f-secondary": colorParchment,
          "f-tertiary": colorMuted,
          "f-disabled-1": colorMuted,
          "f-disabled-2": colorParchment,
          // backgrounds:
          "bg-primary": colorPaper,
          "bg-secondary": colorParchment,
          "bg-tertiary": colorSepia,
          "bg-card": colorParchment,
        },
        dark: {
          primary: colorDarkAccent,
          secondary: colorDarkCard,
          tertiary: colorDarkBg,
          brand: colorDarkAccent,
          neutral: colorDarkText,
          info: colorDarkMuted,
          background: colorDarkBg,
          border: colorDarkBorder,
          // states:
          "s-success": colorDarkAccent,
          "s-error": colorDarkAccent,
          "s-warning": colorDarkAccent,
          "s-info": colorDarkMuted,
          "s-info-1": colorDarkMuted,
          // components:
          "c-default": colorDarkText,
          "c-hover": colorDarkText,
          "c-pressed": colorDarkMuted,
          "c-disabled-1": colorDarkMuted,
          "c-disabled-2": colorDarkCard,
          "c-error": colorDarkAccent,
          // icons:
          "i-primary": colorDarkMuted,
          "i-secondary": colorDarkCard,
          "i-tertiary": colorDarkText,
          // fonts:
          "f-primary": colorDarkText,
          "f-secondary": colorDarkCard,
          "f-tertiary": colorDarkMuted,
          "f-disabled-1": colorDarkMuted,
          "f-disabled-2": colorDarkCard,
          // backgrounds:
          "bg-primary": colorDarkBg,
          "bg-secondary": colorDarkCard,
          "bg-tertiary": colorDarkBg,
          "bg-card": colorDarkCard,
        },
      },
      { defaultTheme: "light" }
    ),
    plugin(function ({ addComponents, theme }) {
      addComponents({
        ".mas-banner": {
          fontSize: "42px",
          fontWeight: "700",
          fontFamily: theme("fontFamily.display"),
          lineHeight: "1.2",
          letterSpacing: "-0.02em",
        },
        ".mas-title": {
          fontSize: "36px",
          fontWeight: "700",
          fontFamily: theme("fontFamily.display"),
          lineHeight: "1.3",
          letterSpacing: "-0.01em",
        },
        ".mas-subtitle": {
          fontSize: "24px",
          fontWeight: "600",
          fontFamily: theme("fontFamily.display"),
          lineHeight: "1.4",
        },
        ".mas-h2": {
          fontSize: "20px",
          fontWeight: "600",
          fontFamily: theme("fontFamily.display"),
          lineHeight: "1.4",
        },
        ".mas-h3": {
          fontSize: "16px",
          fontWeight: "600",
          fontFamily: theme("fontFamily.display"),
          lineHeight: "1.5",
        },
        ".mas-buttons": {
          fontSize: "16px",
          fontWeight: "500",
          fontFamily: theme("fontFamily.sans"),
          lineHeight: "1.5",
        },
        ".mas-menu-active": {
          fontSize: "16px",
          fontWeight: "600",
          fontFamily: theme("fontFamily.sans"),
          lineHeight: "1.5",
        },
        ".mas-menu-default": {
          fontSize: "16px",
          fontWeight: "500",
          fontFamily: theme("fontFamily.sans"),
          lineHeight: "1.5",
        },
        ".mas-body": {
          fontSize: "16px",
          fontWeight: "400",
          fontFamily: theme("fontFamily.sans"),
          lineHeight: "1.6",
        },
        ".mas-body2": {
          fontSize: "14px",
          fontWeight: "400",
          fontFamily: theme("fontFamily.sans"),
          lineHeight: "1.6",
        },
        ".mas-caption": {
          fontSize: "12px",
          fontWeight: "400",
          fontFamily: theme("fontFamily.sans"),
          lineHeight: "1.5",
        },
        ".active-button": {
          "@apply transition-all duration-100 ease-in-out border border-border":
            {},
          "&:hover": {
            "@apply -translate-y-[2%] shadow-md": {},
          },
          "&:active": {
            "@apply translate-y-[2%] shadow-none": {},
          },
        },
      });
    }),
  ],
};
