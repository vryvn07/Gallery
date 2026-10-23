/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gallery: {
          light: {
            bg: '#ffffff',
            surface: '#f8fafc',
            card: '#ffffff',
            border: '#e2e8f0',
            text: '#0f172a',
            muted: '#64748b',
          },
          dark: {
            bg: '#0f1117',
            surface: '#181b24',
            card: '#1e222d',
            border: '#2a2f3d',
            text: '#f1f5f9',
            muted: '#94a3b8',
          },
          accent: {
            DEFAULT: '#2563eb', // Samsung-style signature active blue
            hover: '#1d4ed8',
            subtle: '#eff6ff',
            darkSubtle: '#1e3a8a33',
          }
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
