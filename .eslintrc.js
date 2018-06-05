module.exports = {
    "env": {
        "browser": false
    },
    "extends": "standard",
    "rules": {
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "semi": ["error", "always"],
        "operator-linebreak": ["error", "before"],
        "comma-dangle": ["error", "only-multiline"],
        "linebreak-style": ["error", "unix"]
    }
};