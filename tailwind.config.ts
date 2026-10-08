import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0b0e14',
        surface: '#10141e',
        panel: '#131826',
        card: '#151a27',
        elevated: '#1b2233',
        hover: '#222b40',
        input: '#0e121b',
        subtle: '#1e2638',
        cardborder: '#252f45',
        bull: {
          DEFAULT: '#22C55E',
          glow: 'rgba(34, 197, 94, 0.25)',
          bg: 'rgba(34, 197, 94, 0.12)',
        },
        bear: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.25)',
          bg: 'rgba(239, 68, 68, 0.12)',
        },
        primary: {
          DEFAULT: '#2962ff',
          hover: '#1e53e5',
          glow: 'rgba(41, 98, 255, 0.3)',
        },
        gold: {
          DEFAULT: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.12)',
        },
        muted: '#94a3b8',
        faint: '#64748b',
        main: '#f0f4f8',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      animation: {
        'flash-up': 'flashGreen 0.7s cubic-bezier(0.1, 1, 0.1, 1)',
        'flash-down': 'flashRed 0.7s cubic-bezier(0.1, 1, 0.1, 1)',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(0, 240, 144, 0.4)', boxShadow: '0 0 12px rgba(0, 240, 144, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(255, 59, 87, 0.4)', boxShadow: '0 0 12px rgba(255, 59, 87, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
