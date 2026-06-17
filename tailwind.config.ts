import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { serif: ['var(--font-pt-serif)', 'Georgia', 'serif'] },
      colors: {
        strata: {
          bg:     '#ffffff',
          text:   '#000000',
          muted:  '#6e6e73',
          border: '#d2d2d7',
          subtle: '#f5f5f7',
          accent: '#0066cc',
        }
      }
    }
  },
  plugins: []
}
export default config
