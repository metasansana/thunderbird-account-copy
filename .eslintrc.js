module.exports = {
    root: true,
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
    globals: {
        messenger: true,
        console: true
    },
    parserOptions: {
        ecmaVersion: 2022,
        ecmaFeature: {},
        sourceType: "module"
    },
    env: { es2022: true },
    ignorePatterns: [".eslintrc.js"],
    plugins: ["prettier"],
    rules: {
        "no-unused-vars": "off",
        "require-yield": "off",
        "prefer-const": "off"
    }
};
