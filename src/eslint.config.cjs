/**
 * @file ESLint configuration file implementing (almost) [Standard JS style]{@link https://standardjs.com/},
 * [ESLint recommended js rules]{@link https://eslint.org/docs/latest/rules/}, 
 * [jsdoc rules]{@link https://www.npmjs.com/package/eslint-plugin-jsdoc} and, when appropriate, 
 * [recommended node]{@link https://www.npmjs.com/package/eslint-plugin-node} and 
 * [react]{@link https://www.npmjs.com/package/eslint-plugin-react} rules as well.
 * 
 * Our one exception to the standard style is implementing aligned colons on multiline 
 * 'key-spacing'. We think it makes things more readable. We also add a preference for regex literals where possible 
 * and 'no-console' (use <code>process.stdout</code>)
 */

const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const babelParser = require('@babel/eslint-parser')
const globalsPkg = require('globals')
const importPlugin = require('eslint-plugin-import')
const jsdocPlugin = require('eslint-plugin-jsdoc')
const nodePlugin = require('eslint-plugin-node')
const promisePlugin = require('eslint-plugin-promise')
const nPlugin = require('eslint-plugin-n')
const standardPlugin = require('eslint-config-standard')
const reactPlugin = require('eslint-plugin-react')
const js = require('@eslint/js')

const packageContents = readFileSync('./package.json', { encoding : 'utf8' })
const packageJSON = JSON.parse(packageContents)
const { engines = { node : true } } = packageJSON

const eslintConfig = [
  {
    files           : ['**/*.{cjs,js,jsx,mjs}'],
    languageOptions : {
      parser        : babelParser,
      parserOptions : {
        sourceType        : 'module',
        requireConfigFile : true,
        babelOptions      : {
          configFile : join(__dirname, 'babel', 'babel.config.cjs')
        }
      },
      ecmaVersion : 'latest'
    },
    plugins : {
      standard : standardPlugin,
      jsdoc    : jsdocPlugin,
      import   : importPlugin,
      promise  : promisePlugin,
      n        : nPlugin
    },
    rules : {
      ...js.configs.recommended.rules,
      ...standardPlugin.rules,
      ...jsdocPlugin.configs['flat/recommended-error'].rules,
      'jsdoc/require-file-overview' : 'error',
      'jsdoc/require-description'   : 'error',
      'key-spacing'                 : ['error', {
        singleLine : {
          beforeColon : true,
          afterColon  : true,
          mode        : 'strict'
        },
        multiLine : {
          beforeColon : true,
          afterColon  : true,
          align       : 'colon'
        }
      }],
      'no-console'            : 'error',
      'prefer-regex-literals' : 'error'
    }
  },
  {
    files           : ['**/*.jsx'],
    languageOptions : {
      parserOptions : {
        ecmaFeatures : {
          jsx : true
        }
      }
    },
    settings : {
      react : {
        version : 'detect'
      }
    },
    rules : {
      // can't use 'react.config.recommended directly because as of writing it's still usin the old eslint.rc style
      ...reactPlugin.configs.recommended.rules
    },
    plugins : { react : reactPlugin }
  },
  {
    files           : ['**/_tests_/**', '**/*.test.{cjs,js,jsx,mjs}'],
    languageOptions : {
      globals : {
        ...globalsPkg.jest
      }
    }
  }
]

if (engines?.node !== undefined) {
  eslintConfig.push({
    plugins         : { node : nodePlugin },
    languageOptions : {
      globals : globalsPkg.node
    },
    rules : {
      ...nodePlugin.configs.recommended.rules,
      'node/prefer-promises/dns' : 'error',
      'node/prefer-promises/fs'  : 'error'
    }
  })
}

module.exports = eslintConfig
