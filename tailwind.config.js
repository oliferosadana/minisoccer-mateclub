/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          bg: '#f9f7f7',
          subtle: '#dbe2ef',
          primary: '#3f72af',
          primaryDark: '#2e588a',
          dark: '#112d4e',
          darker: '#0a1d33'
        },
        brand: {
          green: '#16a34a',
          emerald: '#10b981',
          amber: '#d97706',
          red: '#dc2626',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(17, 45, 78, 0.05), 0 1px 2px rgba(17, 45, 78, 0.03)',
        card: '0 4px 6px -1px rgba(17, 45, 78, 0.06), 0 2px 4px -2px rgba(17, 45, 78, 0.04)',
        elevated: '0 10px 25px -3px rgba(17, 45, 78, 0.1), 0 4px 6px -4px rgba(17, 45, 78, 0.06)'
      }
    },
  },
  plugins: [],
}
