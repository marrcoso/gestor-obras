/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        headline: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'fluid-hero': 'clamp(1.5rem, 3vw + 0.5rem, 2.25rem)',
        'fluid-page': 'clamp(1.25rem, 2vw + 0.5rem, 1.75rem)',
        'fluid-section': 'clamp(1.0625rem, 1.5vw + 0.25rem, 1.375rem)',
        'fluid-card': 'clamp(0.9375rem, 1vw + 0.25rem, 1.125rem)',
        'fluid-kpi': 'clamp(1.5rem, 2.8vw + 0.5rem, 2.25rem)',
        'fluid-body': 'clamp(0.8125rem, 0.8vw + 0.2rem, 0.9375rem)',
        'fluid-caption': 'clamp(0.6875rem, 0.6vw + 0.2rem, 0.8125rem)',
        'fluid-mono': 'clamp(0.6875rem, 0.5vw + 0.25rem, 0.75rem)',
      },
      colors: {
        app: 'var(--bg-app)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          low: 'var(--bg-surface-low)',
          container: 'var(--bg-surface-container)',
          high: 'var(--bg-surface-high)',
          highest: 'var(--bg-surface-highest)',
        },
        card: {
          DEFAULT: 'var(--bg-card)',
          hover: 'var(--bg-card-hover)',
        },
        input: 'var(--bg-input)',
        navbar: 'var(--bg-navbar)',
        sidebar: {
          DEFAULT: 'var(--bg-sidebar)',
          hover: 'var(--bg-sidebar-hover)',
          active: 'var(--bg-sidebar-active)',
          'text-active': 'var(--text-sidebar-active)',
          'text-muted': 'var(--text-sidebar-muted)',
        },
        brand: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          container: 'var(--primary-container)',
          light: 'var(--primary-light)',
        },
        tech: {
          DEFAULT: 'var(--technical-blue)',
          hover: 'var(--technical-blue-hover)',
          light: 'var(--technical-blue-light)',
        },
        status: {
          paid: 'var(--status-paid)',
          'paid-bg': 'var(--status-paid-bg)',
          pending: 'var(--status-pending)',
          'pending-bg': 'var(--status-pending-bg)',
          warning: 'var(--status-warning)',
          late: 'var(--status-late)',
          'late-bg': 'var(--status-late-bg)',
        },
        content: {
          main: 'var(--text-main)',
          muted: 'var(--text-muted)',
          dim: 'var(--text-dim)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        primary: 'var(--shadow-primary)',
      },
    },
  },
  plugins: [],
};
