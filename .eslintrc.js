module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  plugins: ['import', 'prettier'],
  rules: {
    'no-await-in-loop': 'off',
    'max-len': ['error', {
      code: 140,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
    }],
    'no-underscore-dangle': 'off',
    'no-restricted-syntax': 'off',
  },
};
