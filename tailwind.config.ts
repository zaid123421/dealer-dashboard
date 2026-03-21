import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {

      /* ───────── COLORS ───────── */
      colors: {
        primary: {
          dark: "var(--color-primary-main-dark)",
          light: "var(--color-primary-main-light)",
          container: "var(--color-primary-container)",
          onContainer: "var(--color-primary-on-container)",
          inverse: "var(--color-primary-inverse)",
        },

        secondary: {
          main: "var(--color-secondary-main)",
          container: "var(--color-secondary-container)",
          onSurface: "var(--color-secondary-on-surface)",
        },

        tertiary: {
          dark: "var(--color-tertiary-main-dark)",
          light: "var(--color-tertiary-main-light)",
          container: "var(--color-tertiary-container)",
          onContainer: "var(--color-tertiary-on-container)",
        },

        warning: {
          dark: "var(--color-warning-main-dark)",
          light: "var(--color-warning-main-light)",
          container: "var(--color-warning-container)",
          onContainer: "var(--color-warning-on-container)",
        },

        error: {
          main: "var(--color-error-main)",
          container: "var(--color-error-container)",
          onContainer: "var(--color-error-on-container)",
        },

        success: {
          dark: "var(--color-success-main-dark)",
          light: "var(--color-success-main-light)",
          container: "var(--color-success-container)",
          onContainer: "var(--color-success-on-container)",
        },

        info: {
          main: "var(--color-info-main)",
          container: "var(--color-info-container)",
          onContainer: "var(--color-info-on-container)",
        },

        surface: {
          dim: "var(--color-surface-dim)",
          default: "var(--color-surface-default)",
          bright: "var(--color-surface-bright)",
          lowest: "var(--color-surface-container-lowest)",
          low: "var(--color-surface-container-low)",
          container: "var(--color-surface-container)",
          high: "var(--color-surface-container-high)",
          light: "var(--color-surface-light)",
          lightContainer: "var(--color-surface-light-container)",
        },

        chart: {
          1: "var(--color-chart-1)",
          2: "var(--color-chart-2)",
          3: "var(--color-chart-3)",
          4: "var(--color-chart-4)",
          5: "var(--color-chart-5)",
          6: "var(--color-chart-6)",
        },
      },

      /* ───────── SPACING ───────── */
      spacing: {
        1: "var(--spacing-1)",
        2: "var(--spacing-2)",
        3: "var(--spacing-3)",
        4: "var(--spacing-4)",
        5: "var(--spacing-5)",
        6: "var(--spacing-6)",
        8: "var(--spacing-8)",
        10: "var(--spacing-10)",
        12: "var(--spacing-12)",
        16: "var(--spacing-16)",
        20: "var(--spacing-20)",
        24: "var(--spacing-24)",
      },

      /* ───────── BORDER RADIUS ───────── */
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },

      /* ───────── FONTS ───────── */
      fontFamily: {
        sans: ["var(--font-family-sans)"],
        arabic: ["var(--font-family-arabic)"],
        mono: ["var(--font-family-mono)"],
      },

      /* ───────── FONT SIZES ───────── */
      fontSize: {
        "display-lg": ["var(--font-size-display-lg)", { lineHeight: "1.1" }],
        "display-md": ["var(--font-size-display-md)", { lineHeight: "1.15" }],
        "headline-lg": ["var(--font-size-headline-lg)", { lineHeight: "1.2" }],
        "headline-md": ["var(--font-size-headline-md)", { lineHeight: "1.25" }],
        "headline-sm": ["var(--font-size-headline-sm)", { lineHeight: "1.3" }],
        "title-lg": ["var(--font-size-title-lg)", { lineHeight: "1.4" }],
        "title-md": ["var(--font-size-title-md)", { lineHeight: "1.4" }],
        "body-lg": ["var(--font-size-body-lg)", { lineHeight: "1.6" }],
        "body-md": ["var(--font-size-body-md)", { lineHeight: "1.6" }],
        "label-lg": ["var(--font-size-label-lg)", { lineHeight: "1.5" }],
        "label-md": ["var(--font-size-label-md)", { lineHeight: "1.5" }],
        "label-sm": ["var(--font-size-label-sm)", { lineHeight: "1.5" }],
      },

      /* ───────── FONT WEIGHT ───────── */
      fontWeight: {
        regular: "var(--font-weight-regular)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
        black: "var(--font-weight-black)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;