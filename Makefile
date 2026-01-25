.PHONY: help up down logs build ps migrate migrate-generate clean

help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## コンテナを起動
	docker compose up -d

down: ## コンテナを停止
	docker compose down

logs: ## ログを表示
	docker compose logs -f app

build: ## イメージを再ビルドして起動
	docker compose up -d --build

ps: ## コンテナの状態を表示
	docker compose ps

migrate: ## マイグレーションを実行
	docker compose exec app npm run migration:run

migrate-generate: ## マイグレーションを生成
	@read -p "マイグレーション名: " name; \
	docker compose exec app npm run migration:generate -- src/infrastructure/database/migrations/$$name

clean: ## コンテナとボリュームを削除
	docker compose down -v
