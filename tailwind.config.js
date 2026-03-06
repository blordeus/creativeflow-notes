/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream:    '#F4F0E8',
        slate:    '#435066',
        pine:     '#365349',
        graphite: '#1F1F1F',
        olive:    '#768079',
        danger:   '#c0392b',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans:  ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
