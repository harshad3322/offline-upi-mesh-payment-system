import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,.18), 0 20px 60px rgba(0,0,0,.45)',
      },
      backgroundImage: {
        'mesh-grid':
          'linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '.38', transform: 'scale(1)' },
          '50%': { opacity: '.65', transform: 'scale(1.08)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -18px, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 6s ease-in-out infinite',
        drift: 'drift 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;