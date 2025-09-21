/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f7ff',
          100: '#f0eeff',
          200: '#e3ddff',
          300: '#d1c2ff',
          400: '#b899ff',
          500: '#9b6eff',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6b46c1',
          900: '#483C8E',
        },
        accent: {
          25: '#fefcfe',
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#C36BA8',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        gray: {
          50: '#fafbfc',
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#7f8c8d',
          700: '#5a6c7d',
          800: '#34495e',
          900: '#2c3e50',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'custom-light': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'custom-medium': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'custom-heavy': '0 12px 40px rgba(0, 0, 0, 0.2)',
        'accent': '0 4px 16px rgba(195, 107, 168, 0.3)',
        'accent-hover': '0 8px 25px rgba(195, 107, 168, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}