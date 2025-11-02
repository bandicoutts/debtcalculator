import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#f7f7f7',
          dark: '#191919',
        },
        surface: {
          dark: '#1e293b',
          darker: '#0f172a',
        },
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        border: {
          dark: '#334155',
          darker: '#1e293b',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
