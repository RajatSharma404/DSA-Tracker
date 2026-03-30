/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px', // iPhone SE
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      minWidth: {
        '50': '12.5rem',
        '60': '15rem',
      },
      minHeight: {
        '150': '37.5rem',
        '175': '43.75rem',
      },
      height: {
        '150': '37.5rem',
        '175': '43.75rem',
      },
    },
  },
  plugins: [],
};
export default config;
