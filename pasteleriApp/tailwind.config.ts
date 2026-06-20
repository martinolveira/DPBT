import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50:  '#fdf6ec',
          100: '#f5e6d3',
          200: '#e8d5b7',
          300: '#d4b896',
          400: '#c2855a',
          500: '#a0522d',
          600: '#7c4a1e',
          700: '#5c3a1e',
          800: '#3d2010',
          900: '#1e0f05',
        },
      },
    },
  },
  plugins: [],
}

export default config
