/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "slow-spin": "spin 1s linear infinite", // Slower spinning animation
      },
    },
  },
  plugins: [],
};

