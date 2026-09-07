/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        /* CI ของ GOODFOOD เป็นโทนเขียว — ใช้ชื่อ brand ทั้งโปรเจกต์
           (โปรเจกต์ต้นทาง naraipizzeria เป็นน้ำเงิน/เหลืองอำพัน ที่นี่เขียวล้วน) */
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',   // สีหลัก
          700: '#047857',   // สีหลักแบบเข้ม
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
    },
  },
  plugins: [],
}
