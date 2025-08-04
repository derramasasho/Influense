module.exports = {
  root: true,
  extends: ["@influencer-platform/eslint-config/nextjs"],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}