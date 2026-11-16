import plugin from 'tailwindcss/plugin';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        'emerald': {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'teal': {
          50: '#e0f7f4',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c4b7',
          500: '#008080',
          600: '#006d77',
          700: '#004f5e',
          800: '#003940',
          900: '#002c2e',
        },
        'water': {
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'amber': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'rose': {
          50: '#fff1f2',
          100: '#ffe4e5',
          200: '#fecaca',
          300: '#fda7a7',
          400: '#fb5454',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'neutral': {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e5e5e3',
          300: '#d4d4d2',
          400: '#a3a3a0',
          500: '#737370',
          600: '#525250',
          700: '#40403d',
          800: '#272725',
          900: '#1c1c1a',
        },
        // Dark theme colors
        'dark': {
          50: '#0b1512',
          100: '#0f1a17',
          200: '#16211a',
          300: '#1c2821',
          400: '#242b24',
          500: '#2d373b',
          600: '#374145',
          700: '#4b5563',
          800: '#6b7280',
          900: '#9ca3af',
        },
        // Glass border colors
        'glass-border': {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(255, 255, 255, 0.05)',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'variable': '--font-sans',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(37, 99, 235, 0.12)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.25)',
        'glass-lg': '0 16px 44px rgba(37, 99, 235, 0.28)',
        'glass-inner': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
      },
      backdropBlur: {
        'xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'glass': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
      zIndex: {
        'drawer': '40',
        'modal': '50',
        'toast': '60',
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, addUtilities }) {
      // CSS variables for light mode
      addBase({
        ':root': {
          '--color-bg': '#fafaf9',
          '--color-bg-elevated': 'rgba(255, 255, 255, 0.62)',
          '--color-border': 'rgba(255, 255, 255, 0.8)',
          '--color-text': '#0f172a',
          '--color-text-muted': '#64748b',
          '--color-primary': '#059669',
          '--color-primary-foreground': '#ffffff',
          '--color-primary-hover': '#047857',
          '--color-secondary': '#0ea5e9',
          '--color-secondary-foreground': '#ffffff',
          '--color-danger': '#dc2626',
          '--color-danger-foreground': '#ffffff',
          '--color-warning': '#d97706',
          '--color-warning-foreground': '#ffffff',
          '--color-success': '#16a34a',
          '--color-success-foreground': '#ffffff',
          '--color-accent': '#8b5cf6',
          '--color-accent-foreground': '#ffffff',
          '--shadow-glass': '0 8px 32px rgba(37, 99, 235, 0.12)',
          '--ring-color': '#22c55e',
        },
        '[class="dark"]': {
          '--color-bg': '#0b1512',
          '--color-bg-elevated': 'rgba(255, 255, 255, 0.05)',
          '--color-border': 'rgba(255, 255, 255, 0.1)',
          '--color-text': '#f8fafc',
          '--color-text-muted': '#94a3b8',
          '--color-primary': '#22c55e',
          '--color-primary-foreground': '#0f172a',
          '--color-primary-hover': '#16a34a',
          '--color-secondary': '#0284c7',
          '--color-secondary-foreground': '#f8fafc',
          '--color-danger': '#ef4444',
          '--color-danger-foreground': '#f8fafc',
          '--color-warning': '#f59e0b',
          '--color-warning-foreground': '#0f172a',
          '--color-success': '#22c55e',
          '--color-success-foreground': '#f8fafc',
          '--color-accent': '#a855f7',
          '--color-accent-foreground': '#f8fafc',
          '--shadow-glass': '0 8px 32px rgba(0, 0, 0, 0.25)',
          '--ring-color': '#22c55e',
        },
      });

      // Utility classes
      addUtilities({
        '.glass': {
          'background': 'var(--color-bg-elevated)',
          'backdrop-filter': 'blur(20px) saturate(160%)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(160%)',
          'border': '1px solid var(--color-border)',
          'border-radius': '1.5rem',
          'box-shadow': 'var(--shadow-glass)',
        },
        '.glass-dark': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(20px) saturate(160%)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(160%)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'border-radius': '1.5rem',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.25)',
        },
        '.text-primary': {
          'color': 'var(--color-primary)',
        },
        '.text-secondary': {
          'color': 'var(--color-secondary)',
        },
        '.text-danger': {
          'color': 'var(--color-danger)',
        },
        '.text-success': {
          'color': 'var(--color-success)',
        },
        '.bg-primary': {
          'background-color': 'var(--color-primary)',
        },
        '.bg-secondary': {
          'background-color': 'var(--color-secondary)',
        },
        '.bg-danger': {
          'background-color': 'var(--color-danger)',
        },
        '.ring-primary': {
          'ring-color': 'var(--ring-color)',
        },
      });
    }),
  ],
};