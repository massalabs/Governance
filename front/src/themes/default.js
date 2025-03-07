import { createThemes } from "tw-colors";
import plugin from "tailwindcss/plugin";

// Newspaper-style colors
const colorPaper = "#F7F3EB"; // Warm off-white for main background
const colorSepia = "#EDE5D8"; // Warmer sepia for secondary elements
const colorInk = "#1A1715"; // Rich dark brown-black for text
const colorAccent = "#8B0000"; // Deep red for accents
const colorParchment = "#E8E2D7"; // Warm light beige for cards
const colorBorder = "#D3C7B8"; // Warm beige for borders

// Dark mode colors
const colorDarkBg = "#2A2520"; // Warm dark brown background
const colorDarkCard = "#332E28"; // Slightly lighter warm brown for cards
const colorDarkText = "#E8E2D7"; // Warm off-white for text
const colorDarkMuted = "#9A8F84"; // Warm gray for muted text
const colorDarkBorder = "#403931"; // Rich brown for borders
const colorDarkAccent = "#E85D5D"; // Warmer, softer red for accents

// Light mode colors
const colorMuted = "#6B635A"; // Warm gray for muted text (light mode)

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
        },
        dark: {
          primary: colorDarkAccent,
          secondary: colorDarkCard,
          tertiary: "#3B352E",
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
          "c-disabled-2": "#3B352E",
          "c-error": colorDarkAccent,
          // icons:
          "i-primary": colorDarkMuted,
          "i-secondary": "#3B352E",
          "i-tertiary": colorDarkText,
          // fonts:
          "f-primary": colorDarkText,
          "f-secondary": "#3B352E",
          "f-tertiary": colorDarkMuted,
          "f-disabled-1": colorDarkMuted,
          "f-disabled-2": "#3B352E",
        },
      },
      { defaultTheme: "light" }
    ),
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
