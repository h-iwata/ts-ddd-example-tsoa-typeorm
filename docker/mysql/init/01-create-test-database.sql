-- 統合テスト用データベース
--
-- アプリ用の `ddd_example` は docker-compose.yml の MYSQL_DATABASE で作成されるが、
-- テスト用の `ddd_example_test` は作成されないためここで用意する。
-- （src/infrastructure/database/dataSource.ts は NODE_ENV=test のとき
--   `ddd_example_test` に接続する）
--
-- このディレクトリのスクリプトは MySQL のデータディレクトリが空のとき、
-- つまりボリュームを新規作成したときにのみ実行される。
CREATE DATABASE IF NOT EXISTS ddd_example_test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
