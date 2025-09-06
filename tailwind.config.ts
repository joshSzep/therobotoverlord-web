import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // The Robot Overlord Color Palette
        overlord: {
          red: '#FF4757',
          'authority-red': '#FF3742',
          gold: '#FFD700',
          'deep-black': '#0C0C0C',
          'surface-dark': '#1A1A1A',
          'robot-core': '#2B0F0F',
          'card-dark': '#1A0C0C',
          'light-text': '#E8E8E8',
          'muted-light': '#B0B0B0',
        },
        status: {
          'approved-green': '#4ECDC4',
          'warning-amber': '#FFD93D',
          'rejected-red': '#FF6B6B',
          'processing-blue': '#74B9FF',
        }
      },
      fontFamily: {
        'display': ['var(--font-display)', 'system-ui', 'sans-serif'],
        'body': ['var(--font-body)', 'system-ui', 'sans-serif'],
        'overlord': ['var(--font-overlord)', 'monospace'],
      },
      animation: {
        'rotate-slow': 'rotate 80s linear infinite',
        'rotate-very-slow': 'rotate 120s linear infinite',
        'pulse-glow': 'pulse-glow 6s ease-in-out infinite',
        'pulse-scale': 'pulse-scale 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 30px 10px rgba(255,215,0,0.4), 0 0 0 6px #FFD700, 0 0 0 12px #7a1111',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 40px 15px rgba(255,215,0,0.6), 0 0 0 8px #FFD700, 0 0 0 16px #7a1111',
            transform: 'scale(1.05)'
          },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      clipPath: {
        hexagon: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
      },
      backgroundImage: {
        'conic-gold': 'repeating-conic-gradient(from 0deg, rgba(255,215,0,0.3) 0deg 6deg, transparent 6deg 12deg)',
        'conic-red': 'repeating-conic-gradient(from 270deg, rgba(204,0,0,0.45) 0deg 8deg, transparent 8deg 16deg)',
      }
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.clip-hexagon': {
          clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
export default config
