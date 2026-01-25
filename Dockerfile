FROM node:22-alpine

WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# tsoaでルートを生成
RUN npm run tsoa:generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
