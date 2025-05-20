// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // 🌀 Animation personnalisée combinée
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-in-short': 'fadeInShort 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        fadeInShort: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },

      // 🌈 Couleurs personnalisées
      colors: {
        'cyber-blue': '#00f7ff',
        'cyber-red': '#ff0059',
      },
    },
  },
  plugins: [],
};
