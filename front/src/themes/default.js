import { createThemes } from "tw-colors";
import plugin from "tailwindcss/plugin";

// Newspaper-style colors
const colorSepia = "#F4F1EA"; // Light paper background
const colorInk = "#2C2C2C"; // Dark text
const colorAccent = "#8B0000"; // Deep red for accents
const colorParchment = "#E8E6E1"; // Secondary light
const colorDarkSlate = "#1A1A1A"; // Dark mode background
const colorCream = "#FAF9F7"; // Light mode surface
const colorMuted = "#4A4A4A"; // Muted text

/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  theme: {
    fontFamily: {
      serif: ["Merriweather", "Georgia", "serif"],
      sans: ["Inter", "system-ui", "sans-serif"],
    },
  },
  plugins: [
    createThemes({
      light: {
        primary: colorAccent,
        secondary: colorParchment,
        tertiary: colorSepia,
        neutral: colorInk,
        info: colorMuted,
        beige: colorParchment,
        gray: colorCream,
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
      },
      dark: {
        primary: "#B22222",
        secondary: colorDarkSlate,
        tertiary: "#2A2A2A",
        brand: "#B22222",
        neutral: "#E0E0E0",
        info: "#A0A0A0",
        // states:
        "s-success": "#B22222",
        "s-error": "#B22222",
        "s-warning": "#B22222",
        "s-info": "#A0A0A0",
        "s-info-1": "#A0A0A0",
        // components:
        "c-default": "#E0E0E0",
        "c-hover": "#E0E0E0",
        "c-pressed": "#A0A0A0",
        "c-disabled-1": "#A0A0A0",
        "c-disabled-2": "#2A2A2A",
        "c-error": "#B22222",
        // icons:
        "i-primary": "#A0A0A0",
        "i-secondary": "#2A2A2A",
        "i-tertiary": "#E0E0E0",
        // fonts:
        "f-primary": "#E0E0E0",
        "f-secondary": "#2A2A2A",
        "f-tertiary": "#A0A0A0",
        "f-disabled-1": "#A0A0A0",
        "f-disabled-2": "#2A2A2A",
      },
    }),
    plugin(function ({ addComponents, theme }) {
      addComponents({
        ".mas-banner": {
          fontSize: "42px",
          fontWeight: "700",
          fontFamily: theme("fontFamily.serif"),
          lineHeight: "1.2",
          letterSpacing: "-0.02em",
        },
        ".mas-title": {
          fontSize: "36px",
          fontWeight: "700",
          fontFamily: theme("fontFamily.serif"),
          lineHeight: "1.3",
          letterSpacing: "-0.01em",
        },
        ".mas-subtitle": {
          fontSize: "24px",
          fontWeight: "600",
          fontFamily: theme("fontFamily.serif"),
          lineHeight: "1.4",
        },
        ".mas-h2": {
          fontSize: "20px",
          fontWeight: "600",
          fontFamily: theme("fontFamily.serif"),
          lineHeight: "1.4",
        },
        ".mas-h3": {
          fontSize: "16px",
          fontWeight: "600",
          fontFamily: theme("fontFamily.serif"),
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
          fontFamily: theme("fontFamily.serif"),
          lineHeight: "1.6",
        },
        ".mas-body2": {
          fontSize: "14px",
          fontWeight: "400",
          fontFamily: theme("fontFamily.serif"),
          lineHeight: "1.6",
        },
        ".mas-caption": {
          fontSize: "12px",
          fontWeight: "400",
          fontFamily: theme("fontFamily.sans"),
          lineHeight: "1.5",
        },
        ".active-button": {
          "@apply transition-all duration-100 ease-in-out": {},
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
