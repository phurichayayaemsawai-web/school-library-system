import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        school: {
          navy: '#1e293b',
          gold: '#f59e0b',
          emerald: '#10b981',
          coral: '#f43f5e',
          sky: '#0284c7'
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};
export default config;
