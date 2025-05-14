/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // You can add the animation here later if you prefer
      // animation: {
      //   aurora: 'aurora 20s infinite linear',
      // },
      // keyframes: {
      //   aurora: {
      //     '0%, 100%': {
      //       backgroundPosition: '0% 50%',
      //       backgroundSize: '300% 300%',
      //     },
      //     '50%': {
      //       backgroundPosition: '100% 50%',
      //       backgroundSize: '350% 350%',
      //     },
      //   },
      // },
    },
  },
  plugins: [],
};