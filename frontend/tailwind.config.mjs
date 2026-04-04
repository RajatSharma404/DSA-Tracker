/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "375px", // iPhone SE
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        dark: {
          bg: {
            primary: "#0a0a0a",
            secondary: "#0d0d0d",
            tertiary: "#111111",
            hover: "#1a1a1a",
            active: "#222222",
          },
          text: {
            primary: "#ffffff",
            secondary: "#c0c0c0",
            muted: "#808080",
            disabled: "#595959",
          },
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      minWidth: {
        50: "12.5rem",
        60: "15rem",
      },
      minHeight: {
        150: "37.5rem",
        175: "43.75rem",
      },
      height: {
        150: "37.5rem",
        175: "43.75rem",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.2)",
        sm: "0 2px 4px rgba(0, 0, 0, 0.2)",
        md: "0 4px 8px rgba(0, 0, 0, 0.25)",
        lg: "0 8px 16px rgba(0, 0, 0, 0.3)",
        xl: "0 16px 32px rgba(0, 0, 0, 0.35)",
      },
      transitionDuration: {
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
        700: "700ms",
      },
      opacity: {
        2: "0.02",
        3: "0.03",
        5: "0.05",
        10: "0.1",
        15: "0.15",
        20: "0.2",
      },
      animation: {
        "pulse-subtle": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
