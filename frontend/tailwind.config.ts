import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#742370',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.1)'
      },
      borderRadius: {
        card: '12px'
      }
    },
  },
  plugins: [],
} satisfies Config
