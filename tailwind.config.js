/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        // Vue-inspired palette: green accent on deep navy surfaces.
        surface: '#1a2332',
        card: '#243140',
        border: '#34465a',
        accent: '#42b883',
        accent2: '#42d392',
      },
    },
  },
  plugins: [],
}
