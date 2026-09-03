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
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        cute: {
          pink: '#f472b6',
          rose: '#fb7185',
          blush: '#fff1f2',
          card: '#ffffff',
          soft: '#fdf2f8',
          accent: '#db2777'
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(244, 114, 182, 0.05)',
        'xs': '0 1px 3px 0 rgba(244, 114, 182, 0.1)',
        'soft': '0 4px 20px -2px rgba(236, 72, 153, 0.08)',
        'card': '0 10px 25px -5px rgba(244, 114, 182, 0.1), 0 8px 10px -6px rgba(244, 114, 182, 0.05)',
        'elevated': '0 20px 25px -5px rgba(236, 72, 153, 0.15), 0 8px 10px -6px rgba(236, 72, 153, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};
export default config;
