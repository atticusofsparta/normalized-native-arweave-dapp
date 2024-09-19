/** @type {import('tailwindcss').Config} */
import { kebabCase } from 'lodash';

import tokens from './tokens/tokens.js';

const colors = Object.fromEntries(
  Object.values(tokens.color).map(({ attributes, value }) => [
    kebabCase(attributes.type),
    value,
  ]),
);
export default {
  content: [],
  darkMode: 'class', // or 'media' or 'class
  theme: {
    extend: {},
    colors,
  },
  plugins: [require('tailwindcss-animate')],
};
