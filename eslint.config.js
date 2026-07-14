import js from '@eslint/js';
import globals from 'globals';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';

export default [
  // ****************************
  // *    全局配置与忽略文件    *
  // ****************************
  {
    ignores: [
      'node_modules',
      'dist',
      // UI 库组件
      'src/components/ui/**',
      // 忽略配置文件
      'eslint.config.js',
      'vite.config.ts',
      // 忽略 public
      'public/**',
    ],
  },

  // ***********************************
  // *   ESlint, TypeScript 基础配置   *
  // ***********************************
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // *******************
  // *   Import 配置   *
  // *******************
  {
    // Import 插件配置
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // import 顺序规则
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'parent',
            'sibling',
            'internal',
            'index',
            'type',
            'unknown',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'external',
              position: 'after',
            },
          ],
          distinctGroup: true,
          'newlines-between': 'never',
          alphabetize: { order: 'asc' },
        },
      ],
    },
  },

  // **************************
  // *   React 相关插件配置   *
  // **************************
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // 激活 React Hooks 规则
      ...reactHooks.configs.recommended.rules,
      // React Refresh 规则，确保只有一个导出
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // ****************************
  // *   自定义规则与语言选项   *
  // ****************************
  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // 允许有意未使用的变量（以下划线开头）
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      // 禁止使用 var，强制 let/const
      'no-var': 'error',
      // 优先使用 const
      'prefer-const': 'error',
      // 箭头函数回调优先
      'prefer-arrow-callback': 'error',
      // 模板字符串优先于字符串拼接
      'prefer-template': 'error',
      // 强制单引号，避免转义
      quotes: ['error', 'single', { avoidEscape: true }],
      // 必须使用 === 和 !==，禁止 == 和 !=
      eqeqeq: 'error',
    },
  },

  // *********************
  // *   Prettier 配置   *
  // *********************
  eslintConfigPrettier,
  {
    plugins: {
      prettier,
    },
    rules: {
      // 将 Prettier 问题作为警告提示
      'prettier/prettier': 'warn',
    },
  },
];
