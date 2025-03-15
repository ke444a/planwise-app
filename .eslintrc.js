// https://docs.expo.dev/guides/using-eslint/
module.exports = {
    extends: "expo",
    ignorePatterns: ["/dist/*"],
    rules: {
        "semi": ["error", "always"],
        "quotes": ["error", "double"],
        "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "indent": ["error", 4]
    },
};
