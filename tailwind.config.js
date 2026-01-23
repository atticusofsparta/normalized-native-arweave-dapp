/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        shimmer:
          'linear-gradient(90deg, transparent, rgba(108, 151, 181, 0.1), transparent)',
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Cinzel Variable', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        one: '0px 0px 4px rgba(0, 0, 0, 0.5)',
        'glow-sm': '0 0 10px rgba(108, 151, 181, 0.3)',
        glow: '0 0 20px rgba(108, 151, 181, 0.4)',
        'glow-lg': '0 0 40px rgba(108, 151, 181, 0.5)',
        'glow-amber': '0 0 20px rgba(255, 185, 56, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(108, 151, 181, 0.1)',
      },
      text: {
        base: '14px',
        scale: 1.2,
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%': { boxShadow: '0 0 20px rgba(108, 151, 181, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(108, 151, 181, 0.5)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: {
        DEFAULT: '#6c97b5',
        50: '#f0f6f9',
        100: '#dae9f0',
        200: '#b8d4e3',
        300: '#8ab8cf',
        400: '#6c97b5',
        500: '#4a7a9e',
        600: '#3a6182',
        700: '#304e69',
        800: '#2a4257',
        900: '#263849',
        950: '#172330',
      },
      background: '#0a0a0b',
      foreground: '#151517',
      surface: {
        DEFAULT: '#1a1a1c',
        light: '#222224',
        lighter: '#2a2a2d',
      },
      success: '#44af69',
      error: '#ef6461',
      warning: {
        DEFAULT: '#ffb938',
        dark: '#d99a2a',
      },
      link: '#6c97b5',
      white: '#fafafa',
      black: '#000000',
      grey: {
        DEFAULT: '#7d7d85',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
      },
      'metallic-grey': '#18191a',
      'dark-grey': '#38393b',
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
