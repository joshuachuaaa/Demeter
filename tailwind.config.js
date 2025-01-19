/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        clock : ['Lexend', 'sans-serif'],
        firacode : ['Fira Code', 'monospace'],
        space: ['Space Mono', 'monospace'],
        monoroboto: ['Roboto Mono', 'monospace']
    },
  },
  plugins: [],
}
}

