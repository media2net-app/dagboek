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
        luxury: {
          gold: '#D4AF37',
          'gold-light': '#F4E4BC',
          'gold-dark': '#B8941F',
          charcoal: '#0F0F0F',
          'charcoal-light': '#1A1A1A',
          'charcoal-lighter': '#2D2D2D',
          'charcoal-dark': '#080808',
          cream: '#F5F5F0',
          'cream-dark': '#E8E8E0',
          dark: {
            bg: '#0F0F0F',
            'bg-light': '#1A1A1A',
            'bg-lighter': '#2D2D2D',
            border: '#2D2D2D',
            text: '#E5E5E5',
            'text-light': '#A0A0A0',
          },
        },
      },
      fontFamily: {
        luxury: ['var(--font-luxury)', 'serif'],
      },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F4E4BC 100%)',
      },
    },
  },
  plugins: [],
}
export default config

