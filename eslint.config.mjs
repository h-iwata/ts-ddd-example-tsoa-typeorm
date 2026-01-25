import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // ============================================
      // 複雑度メトリクス（RuboCop ABC相当）
      // ============================================

      // 循環的複雑度（Condition相当）- 最大10
      complexity: ['error', { max: 10 }],

      // ネストの深さ - 最大4
      'max-depth': ['error', { max: 4 }],

      // 関数の行数 - 最大30行
      'max-lines-per-function': [
        'error',
        {
          max: 30,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // パラメータ数 - 最大7（DDD再構築メソッド考慮）
      'max-params': ['error', { max: 7 }],

      // 文の数 - 最大15（ABC総合相当）
      'max-statements': ['error', { max: 15 }],

      // ネストしたコールバックの深さ - 最大3
      'max-nested-callbacks': ['error', { max: 3 }],

      // ============================================
      // TypeScript厳格ルール
      // ============================================

      // 明示的な戻り値の型を要求
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],

      // 明示的なアクセス修飾子を要求
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public', // publicは省略可
          overrides: {
            constructors: 'no-public',
          },
        },
      ],

      // any禁止
      '@typescript-eslint/no-explicit-any': 'error',

      // 未使用変数エラー
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // null/undefined チェック強制（過度に厳しくならないよう調整）
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: true,
          allowNumber: false,
          allowNullableObject: true,
          allowNullableBoolean: true,
          allowNullableString: true,
          allowNullableNumber: false,
        },
      ],

      // Promise の適切な処理を強制
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // 安全でない操作を禁止
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // テンプレートリテラルで数値・真偽値を許可
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
        },
      ],

      // 一貫した型インポート
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // ============================================
      // Import ルール
      // ============================================

      // import順序
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // 重複importを禁止
      'import/no-duplicates': 'error',

      // ============================================
      // 一般的なベストプラクティス
      // ============================================

      // === を強制
      eqeqeq: ['error', 'always'],

      // console.log を警告（本番では禁止推奨）
      'no-console': 'warn',

      // debugger を禁止
      'no-debugger': 'error',

      // eval を禁止
      'no-eval': 'error',

      // with を禁止
      'no-with': 'error',

      // var を禁止
      'no-var': 'error',

      // const を優先
      'prefer-const': 'error',

      // スプレッド構文を優先
      'prefer-spread': 'error',

      // テンプレートリテラルを優先
      'prefer-template': 'error',

      // アロー関数を優先
      'prefer-arrow-callback': 'error',

      // オブジェクトショートハンドを優先
      'object-shorthand': 'error',

      // ============================================
      // 命名規則
      // ============================================
      '@typescript-eslint/naming-convention': [
        'error',
        // 変数: camelCase または UPPER_CASE
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // 関数: camelCase
        {
          selector: 'function',
          format: ['camelCase'],
        },
        // クラス: PascalCase
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        // インターフェース: PascalCase（Iプレフィックス不要）
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: [],
        },
        // 型エイリアス: PascalCase
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        // enum: PascalCase
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        // enumメンバー: UPPER_CASE
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        // privateメンバー: camelCase（_プレフィックス許可）
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],
    },
  },
  {
    // テストファイル・ファクトリー用の緩和ルール
    files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'max-params': 'off',
      'max-nested-callbacks': 'off', // describe/context/itのネストを許可
      complexity: 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/naming-convention': 'off', // テストでは命名規則を緩和
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // インポート順序はテストでは緩和
      'import/order': 'off',
    },
  },
  {
    // 設定ファイル用の緩和ルール
    files: ['*.config.js', '*.config.mjs', '*.config.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // DIコンテナ設定用の緩和ルール
    files: ['**/di/**/*.ts', '**/database/dataSource.ts'],
    rules: {
      'max-statements': 'off',
      'max-lines-per-function': 'off', // DIコンテナは行数が多くなりがち
      'import/order': 'off', // DIコンテナはカテゴリ別にグループ化
    },
  },
  {
    // ミドルウェア用の緩和ルール
    files: ['**/middlewares/**/*.ts'],
    rules: {
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // 無視するファイル
    ignores: [
      'node_modules/**',
      'dist/**',
      'src/generated/**',
      'coverage/**',
      'eslint.config.mjs',
    ],
  }
);
