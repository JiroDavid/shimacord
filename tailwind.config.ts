import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#ece5d6',
        tan: '#c9b891',
        ink: '#2b2a28',
        shiba: '#b8652c',
        moss: '#8a9a6b',
        sky: '#a9c8e8'
      },
      fontFamily: {
        display: ['"Shippori Mincho"', '"Noto Serif JP"', 'Georgia', 'serif'],
        kanji: ['"Noto Serif JP"', '"Yu Mincho"', 'serif']
      }
    }
  },
  plugins: []
} satisfies Config
