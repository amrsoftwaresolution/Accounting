import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    DEFAULT: '#00713D',
                    50: '#eefaf3',
                    100: '#dcf5e7',
                    200: '#bbeacc',
                    300: '#8ed9a9',
                    400: '#5abf7f',
                    500: '#00713D', // Base
                    600: '#006134',
                    700: '#004d2a',
                    800: '#003d22',
                    900: '#00321d',
                    950: '#001c11',
                },
                secondary: {
                    DEFAULT: '#1e293b', // slate-800
                    50: '#f8fafc',
                    600: '#475569',
                }
            }
        },
    },

    plugins: [forms],
};
