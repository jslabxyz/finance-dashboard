/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        income: '#22c55e',
        expense: '#ef4444',
        net: '#3b82f6',
        transfer: '#8b5cf6',
        savings: '#06b6d4',
      },
    },
  },
  plugins: [],
}
