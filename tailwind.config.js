export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
        mono: ['DM Mono', 'SF Mono', 'monospace'],
      },
      colors: {
        mac: {
          bg: '#f5f5f7',
          surface: 'rgba(255,255,255,0.85)',
          border: 'rgba(0,0,0,0.06)',
          text: '#1d1d1f',
          secondary: '#6e6e73',
          tertiary: '#86868b',
          blue: '#0071e3',
          green: '#34c759',
          red: '#ff3b30',
          orange: '#ff9f0a',
          teal: '#5ac8fa',
          purple: '#bf5af2',
          separator: 'rgba(0,0,0,0.08)',
        }
      },
      boxShadow: {
        'mac': '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        'mac-lg': '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'mac-modal': '0 20px 60px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
