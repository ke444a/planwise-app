// https://docs.expo.dev/guides/using-eslint/
module.exports = {
    extends: "expo",
    ignorePatterns: ["/dist/*"],
    rules: {
        "semi": ["error", "always"],
        "quotes": ["error", "double"],
        "no-unused-vars": ["error", { 
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrors: "all",
            caughtErrorsIgnorePattern: "^_"
        }],
        "indent": ["error", 4],
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                "args": "all",
                "argsIgnorePattern": "^_",
                "caughtErrors": "all",
                "caughtErrorsIgnorePattern": "^_",
                "destructuredArrayIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "ignoreRestSiblings": true
            }
        ]
    },
};
