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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        brand: {
          navy: '#0f172a',
          blue: '#1d4ed8',
          sky: '#0284c7',
          cyan: '#06b6d4',
          light: '#f0f9ff',
          card: '#ffffff',
          accent: '#2563eb'
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(14, 165, 233, 0.05)',
        'xs': '0 1px 3px 0 rgba(14, 165, 233, 0.1)',
        'soft': '0 4px 20px -2px rgba(2, 132, 199, 0.08)',
        'card': '0 10px 25px -5px rgba(2, 132, 199, 0.08), 0 8px 10px -6px rgba(2, 132, 199, 0.04)',
        'elevated': '0 20px 25px -5px rgba(2, 132, 199, 0.12), 0 8px 10px -6px rgba(2, 132, 199, 0.08)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};
export default config;
