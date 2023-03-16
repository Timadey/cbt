/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/templates/**/*.html',
    './app/static/css/src/**/*.{html,js}',
    './app/static/node_modules/flowbite/**/*.js'
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('flowbite/plugin')
  ]
};
