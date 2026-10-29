/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  // Tailwind 3.4 treats `darkMode: false` the same as `media`, which lets
  // OS dark preference activate every `dark:*` utility. This fork is locked
  // to light mode, so keep dark utilities gated behind an explicit `.dark`
  // class that the app never adds.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主色调 — aligned with enterprise theme (replaces legacy teal/cyan scale)
        primary: {
          50: '#f6f3f2',
          100: '#f0eded',
          200: '#eae7e7',
          300: '#cfc4c5',
          400: '#7e7576',
          500: '#000000',
          600: '#000000',
          700: '#1c1b1b',
          800: '#1b1b1b',
          900: '#313030',
          950: '#1c1b1b'
        },
        // 辅助色 - 深蓝灰
        accent: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        // 深色模式背景
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        // High-End AI Gateway (DESIGN.md)
        enterprise: {
          background: '#fcf9f8',
          surface: '#fcf9f8',
          'surface-dim': '#dcd9d9',
          'surface-bright': '#fcf9f8',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f6f3f2',
          'surface-container': '#f0eded',
          'surface-container-high': '#eae7e7',
          'surface-container-highest': '#e5e2e1',
          'surface-variant': '#e5e2e1',
          'on-surface': '#1c1b1b',
          'on-surface-variant': '#4c4546',
          'on-background': '#1c1b1b',
          'inverse-surface': '#313030',
          'inverse-on-surface': '#f3f0ef',
          outline: '#7e7576',
          'outline-variant': '#cfc4c5',
          'surface-tint': '#5e5e5e',
          primary: '#000000',
          'on-primary': '#ffffff',
          'primary-container': '#1b1b1b',
          'on-primary-container': '#848484',
          'inverse-primary': '#c6c6c6',
          secondary: '#5e5e5e',
          'on-secondary': '#ffffff',
          'secondary-container': '#e1dfdf',
          'on-secondary-container': '#626262',
          tertiary: '#000000',
          error: '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#93000a'
        }
      },
      maxWidth: {
        content: '1440px'
      },
      spacing: {
        'margin-desktop': '64px',
        'margin-mobile': '16px'
      },
      fontFamily: {
        sans: [
          'Geist',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif'
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.06)',
        glow: '0 0 20px rgba(0, 0, 0, 0.08)',
        'glow-lg': '0 0 40px rgba(0, 0, 0, 0.12)',
        card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.05)',
        enterprise: '0 4px 12px rgba(0, 0, 0, 0.05)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #000000 0%, #1b1b1b 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'mesh-gradient':
          'radial-gradient(at 40% 20%, rgba(0, 0, 0, 0.04) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0, 0, 0, 0.03) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(0, 0, 0, 0.03) 0px, transparent 50%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 0, 0, 0.08)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 0, 0, 0.12)' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}
