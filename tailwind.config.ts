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
        canvas: '#131722',
        surface: '#1e222d',
        panel: '#171b26',
        card: '#1e222d',
        elevated: '#2a2e39',
        hover: '#2a2e39',
        input: '#131722',
        subtle: '#2a2e39',
        cardborder: '#2a2e39',
        bull: {
          DEFAULT: '#089981',
          glow: 'rgba(8, 153, 129, 0.25)',
          bg: 'rgba(8, 153, 129, 0.12)',
        },
        bear: {
          DEFAULT: '#f23645',
          glow: 'rgba(242, 54, 69, 0.25)',
          bg: 'rgba(242, 54, 69, 0.12)',
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
        muted: '#787b86',
        faint: '#50535e',
        main: '#d1d4dc',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
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
