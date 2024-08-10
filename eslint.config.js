const globals = require("globals");
const pluginJs = require( "@eslint/js");
const tseslint = require( "typescript-eslint");


module.exports = [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];