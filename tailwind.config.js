/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#14171A',
        paper: '#F6F4EF',
        amber: '#FFB020',
        route: '#2E7D5B',
        alert: '#E5484D',
        slate: {
          soft: '#6B7280',
        },
        line: '#E4E0D8',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
