module.exports = {
    extends: ['stylelint-config-standard'],
    plugins: ['stylelint-scss'],
    rules: {
        'no-empty-source': null,
        'color-no-invalid-hex': true,
        'no-descending-specificity': null,
    },
};
