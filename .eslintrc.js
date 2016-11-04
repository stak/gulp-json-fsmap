module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  parserOptions: {sourceType: 'module'},
  plugins: ['promise'],
  rules: {
    /*
      Possible Error
    */
    'no-cond-assign': 'error',
    'no-console': 'error',
    'no-constant-condition': 'error',
    'no-control-regex': 'error',
    'no-debugger': 'error',
    'no-dupe-args': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty-character-class': 'error',
    'no-empty': 'error',
    'no-ex-assign': 'error',
    'no-extra-boolean-cast': 'error',
    'no-extra-parens': ['error', 'functions'], // parens can be meaningful
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-inner-declarations': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-obj-calls': 'error',
    'no-prototype-builtins': 'error',
    'no-regex-spaces': 'error',
    'no-sparse-arrays': 'error',
    'no-template-curly-in-string': 'error',
    'no-unexpected-multiline': 'error',
    'no-unreachable': 'error',
    'no-unsafe-finally': 'error',
    'no-unsafe-negation': 'error',
    'use-isnan': 'error',
    'valid-jsdoc': 'off', // it depends on the project
    'valid-typeof': 'error',

    /*
      Best Practices
    */
    'accessor-pairs': 'error',
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    'class-methods-use-this': 'off', // noisy
    'complexity': 'off', // noisy
    'consistent-return': 'error',
    'curly': 'error',
    'default-case': 'error',
    'dot-location': ['error', 'property'], // preference
    'dot-notation': 'error',
    'eqeqeq': 'error',
    'guard-for-in': 'error',
    'no-alert': 'error',
    'no-caller': 'error',
    'no-case-declarations': 'error',
    'no-div-regex': 'error',
    'no-else-return': 'off', // it's ok, IMO
    'no-empty-function': 'error',
    'no-empty-pattern': 'error',
    'no-eq-null': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-fallthrough': 'error',
    'no-floating-decimal': 'error',
    'no-global-assign': 'error',
    'no-implicit-coercion': 'error',
    'no-implicit-globals': 'error',
    'no-implied-eval': 'error',
    'no-invalid-this': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-magic-numbers': 'off', // too noisy
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-new': 'error',
    'no-octal-escape': 'error',
    'no-octal': 'error',
    'no-param-reassign': 'error',
    'no-proto': 'error',
    'no-redeclare': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-assign': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',
    'no-unused-labels': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-void': 'error',
    'no-warning-comments': 'off', // noisy on developing phase
    'no-with': 'error',
    'radix': 'error',
    'vars-on-top': 'error',
    'wrap-iife': ['error', 'inside'], // preference
    'yoda': ['error', 'never', {exceptRange: true}], // preference

    /*
      Strict Mode
    */
    'strict': 'off', // it depends on the project

    /*
      Variables
    */
    'init-declarations': 'off', // it forces us to write meaningless initial value
    'no-catch-shadow': 'error',
    'no-delete-var': 'error',
    'no-label-var': 'error',
    'no-restricted-globals': 'off', // it depends on the project
    'no-shadow-restricted-names': 'error',
    'no-shadow': 'off', // sometimes shadowing is useful
    'no-undef-init': 'error',
    'no-undef': 'error',
    'no-undefined': 'off', // undefined is safe on strict mode
    'no-unused-vars': 'error',
    'no-use-before-define': 'error',

    /*
      Node.js and CommonJS
    */
    'callback-return': 'off', // the logic based on the name of the function is too trickey
    'global-require': 'error',
    'handle-callback-err': ['error', 'err'], // preference
    'no-mixed-requires': 'error',
    'no-new-require': 'error',
    'no-path-concat': 'error',
    'no-process-env': 'off', // I use process.env
    'no-process-exit': 'error',
    'no-restricted-modules': 'off', // it depends on the project
    'no-sync': 'off', // I use *sync functions

    /*
      Stylistic Issues
    */
    'array-bracket-spacing': 'error',
    'block-spacing': 'error',
    'brace-style': ['error', '1tbs'], // preference
    'camelcase': 'error',
    'comma-dangle': ['error', 'always-multiline'], // preference
    'comma-spacing': 'error',
    'comma-style': ['error', 'last'],
    'computed-property-spacing': ['error', 'never'],
    'consistent-this': ['error', 'that'], // preference
    'eol-last': 'error',
    'func-call-spacing': ['error', 'never'],
    'func-names': 'off', // useless
    'func-style': ['error', 'declaration', {allowArrowFunctions: true}],
    'id-blacklist': 'off', // it depends on the project
    'id-length': 'off', // useless
    'id-match': 'off', // I prefer use 'camelcase' rule
    'indent': ['error', 2], // preference
    'jsx-quotes': 'error',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'linebreak-style': ['error', 'unix'], // preference
    'lines-around-comment': 'off', // noisy
    'max-depth': ['error', 4],
    'max-len': 'off', // I don't care about it
    'max-lines': 'off', // I don't care about it
    'max-nested-callbacks': 'off', // noisy
    'max-params': ['error', 8], // preference
    'max-statements-per-line': 'error',
    'max-statements': 'off', // I don't care about it
    'multiline-ternary': 'off', // I use both style
    'new-cap': 'error',
    'new-parens': 'error',
    'newline-after-var': 'off', // I don't care about it
    'newline-before-return': 'off', // I don't care about it
    'newline-per-chained-call': 'off', // I don't care about it
    'no-array-constructor': 'error',
    'no-bitwise': 'error',
    'no-continue': 'off', // fast-return is useful, IMO
    'no-inline-comments': 'off', // I like inline comments
    'no-lonely-if': 'error',
    'no-mixed-operators': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multiple-empty-lines': 'off', // noisy
    'no-negated-condition': 'off', // negated condition is useful, IMO
    'no-nested-ternary': 'error',
    'no-new-object': 'error',
    'no-plusplus': 'off', // I prefer use it
    'no-restricted-syntax': 'off', // it depends on the project
    'no-tabs': 'error', // preference
    'no-ternary': 'off', // I use it
    'no-trailing-spaces': 'error', // preference
    'no-underscore-dangle': 'off', // I use it to mark as private
    'no-unneeded-ternary': 'error',
    'no-whitespace-before-property': 'error',
    'object-curly-newline': ['error', {multiline: true}], // preference
    'object-curly-spacing': 'error',
    'object-property-newline': 'error',
    'one-var-declaration-per-line': 'off', // use one-var
    'one-var': ['error', {
      initialized: 'never',
      uninitialized: 'always',
    }],
    'operator-assignment': ['error', 'always'],
    'operator-linebreak': ['error', 'after'],
    'padded-blocks': ['error', 'never'], // preference
    'quote-props': ['error', 'consistent-as-needed'], // preference
    'quotes': ['error', 'single'], // preference
    'require-jsdoc': 'off', // it depends on the project
    'semi-spacing': ['error', {
      before: false,
      after: true,
    }],
    'semi': ['error', 'always'], // preference
    'sort-keys': 'off', // noisy
    'sort-vars': 'error',
    'space-before-blocks': ['error', 'always'], // preference
    'space-before-function-paren': ['error', 'never'], // preference
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'spaced-comment': ['error', 'always'], // preference
    'unicode-bom': ['error', 'never'],
    'wrap-regex': 'error',

    /*
      Stylistic Issues
    */
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'always'],
    'arrow-spacing': ['error', {
      before: true,
      after: true,
    }],
    'constructor-super': 'error',
    'generator-star-spacing': ['error', 'after'],
    'no-class-assign': 'error',
    'no-confusing-arrow': 'error',
    'no-const-assign': 'error',
    'no-dupe-class-members': 'error',
    'no-duplicate-imports': 'error',
    'no-new-symbol': 'error',
    'no-restricted-imports': 'off', // it depends on the project
    'no-this-before-super': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-reflect': 'off', // I prefer use old methods
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'require-yield': 'error',
    'rest-spread-spacing': ['error', 'never'],
    'sort-imports': 'off', // I don't care about it
    'symbol-description': 'error',
    'template-curly-spacing': ['error', 'never'],
    'yield-star-spacing': ['error', 'after'],

    /*
      plugin: promise
    */
    'promise/param-names': 'error',
    'promise/always-return': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-native': 'off', // it depends on the project
  },
};

