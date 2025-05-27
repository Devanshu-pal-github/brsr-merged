/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dark-blue': '#00144B',
                'light-gray': '#E5E7EB',
                'teal': '#14B8A6',
            },
            fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
        },

    },
    plugins: [],
}
// 'ment-ai-highlight': '#111827',
