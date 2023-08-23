module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: { impliedStrict: true },
        ecmaVersion: 2020,
        project: ["./tsconfig.json"],
        sourceType: "module",
        tsconfigRootDir: __dirname
    },
    env: {
        es6: true,
        node: true,
        commonjs: true
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-tsdoc'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    rules: {
        'no-useless-concat': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        'tsdoc/syntax': 'warn',
        eqeqeq: ['error', 'always'],
        quotes: ['error', 'single', { avoidEscape: true }]
    },
    ignorePatterns: ['dist', 'node_modules', '*.js'],
    overrides: [
        {
            files: ['src']
        }
    ]
}
