/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e5edff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#0f172a',
        },
        dark: {
          bg: '#0a0d14',
          card: '#111726',
          border: '#1f293d',
          hover: '#1b2438',
        }
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark", "night", "synthwave"],
    darkTheme: "night",
  },
}
