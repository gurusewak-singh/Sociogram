// frontend/tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // ---- Setting a centered container for the app's main content ----
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
      },
    },
    // ---- Extending the default theme ----
    extend: {
      // ---- Defining our custom color palette ----
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main primary color (e.g., for buttons)
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Neutrals for backgrounds, text, borders, etc.
        neutral: {
          50: '#fafafa',   // Lightest background
          100: '#f5f5f5',  // Light background
          200: '#e5e5e5',  // Light borders
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',  // Body text
          800: '#262626',  // Headings
          900: '#171717',  // Darkest text
        },
        // Semantic colors
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
      },
      // ---- Setting our custom font family ----
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}