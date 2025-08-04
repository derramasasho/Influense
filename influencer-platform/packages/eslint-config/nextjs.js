module.exports = {
  extends: [
    './base.js',
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    'react/jsx-sort-props': [
      'warn',
      {
        callbacksLast: true,
        shorthandFirst: true,
        reservedFirst: true,
      },
    ],
    'jsx-a11y/anchor-is-valid': 'off', // Next.js Link component
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
}