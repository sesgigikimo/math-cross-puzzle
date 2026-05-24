/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f3f7ec',
          100: '#e3edd2',
          200: '#cadcaa',
          300: '#a8c479',
          400: '#85ab51',
          500: '#688f3a',
          600: '#52732c',
          700: '#3f5825',
        },
      },
      fontFamily: {
        round: ['"Comic Sans MS"', '"Chalkboard SE"', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
        bounceY: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        pop: 'pop 220ms ease-out',
        shake: 'shake 260ms ease-in-out',
        bounceY: 'bounceY 700ms ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
