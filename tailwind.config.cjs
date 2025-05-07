/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mono': {
          '950': '#0A0A0A',
          '900': '#121212',
          '800': '#1A1A1A',
          '700': '#262626',
          '600': '#404040',
          '500': '#737373',
          '400': '#A3A3A3',
          '300': '#D4D4D4',
          '200': '#E5E5E5',
          '100': '#F5F5F5',
          '50': '#FAFAFA',
        }
      },
      opacity: {
        '98': '0.98'
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      scale: {
        '102': '1.02'
      }
    },
    backgroundImage: {
      'gradient-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
      'gradient-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
    }
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}