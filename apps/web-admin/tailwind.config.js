/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        chatzie: {
          blue: '#1E40AF',
          blueLight: '#3B82F6',
          blueDark: '#1E3A8A',
          red: '#DC2626',
          redLight: '#FEE2E2',
        }
      }
    },
  },
  plugins: [],
}
