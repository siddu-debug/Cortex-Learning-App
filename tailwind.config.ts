import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FAFAF6',
          dim: '#F1EFE7',
          panel: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#171B21',
          soft: '#3D4550',
          faint: '#6B7280',
        },
        border: {
          DEFAULT: '#E4E1D5',
          strong: '#D2CDBC',
        },
        moss: {
          50: '#EAF5F1',
          100: '#CFE9E1',
          300: '#5FA694',
          500: '#0F7B6C',
          600: '#0C6558',
          700: '#094F45',
          900: '#052B25',
        },
        violet: {
          50: '#F1EEFA',
          100: '#DFD8F2',
          300: '#9C8DD0',
          500: '#6B5CA5',
          600: '#584A8A',
          700: '#443A6D',
        },
        gold: {
          300: '#E4C866',
          500: '#C9A227',
          700: '#96781A',
        },
        rust: {
          500: '#B65A3C',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'graph-grid':
          'radial-gradient(circle, #D2CDBC 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '24px 24px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,27,33,0.04), 0 1px 12px rgba(23,27,33,0.05)',
        raised: '0 2px 4px rgba(23,27,33,0.06), 0 8px 24px rgba(23,27,33,0.08)',
      },
      keyframes: {
        pulseNode: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        drawEdge: {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseNode: 'pulseNode 3.2s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
