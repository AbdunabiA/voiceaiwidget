/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          50: '#F0EEFB',
          100: '#E0DCF7',
          200: '#C2B9F0',
          300: '#A396E8',
          400: '#8578E0',
          500: '#6C5CE7',
          600: '#4C3BD4',
          700: '#3B2DA6',
          800: '#2B2079',
          900: '#1A134C',
        },
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: '#6C5CE7',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        muted: { DEFAULT: 'hsl(210 40% 96.1%)', foreground: 'hsl(215.4 16.3% 46.9%)' },
        accent: { DEFAULT: 'hsl(210 40% 96.1%)', foreground: 'hsl(222.2 47.4% 11.2%)' },
        destructive: { DEFAULT: 'hsl(0 84.2% 60.2%)', foreground: 'hsl(210 40% 98%)' },
        card: { DEFAULT: 'hsl(0 0% 100%)', foreground: 'hsl(222.2 84% 4.9%)' },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
    },
  },
  plugins: [],
};
