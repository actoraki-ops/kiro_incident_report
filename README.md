# 病院用インシデントレポートFAQシステム

## 概要
病院スタッフがインシデントレポートに関する質問を簡単に検索・閲覧できるFAQシステムです。

## 特徴
- 🔍 キーワード検索機能
- 📂 カテゴリ別表示
- 📱 レスポンシブデザイン
- ⚡ 高速な検索
- 🔧 簡単な管理機能
- 🗄️ SQLiteデータベース

## 技術仕様
- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **バックエンド**: Node.js, Express.js
- **データベース**: SQLite3
- **API**: RESTful API

## ファイル構成
```
├── index.html          # メイン画面
├── admin.html          # 管理画面
├── style.css           # スタイルシート
├── script.js           # メイン画面のJavaScript
├── admin.js            # 管理画面のJavaScript
├── database.js         # フロントエンド用API呼び出し
├── server.js           # Node.jsサーバー
├── init-db.js          # データベース初期化
├── package.json        # 依存関係管理
├── 要件定義書.md        # プロジェクト要件定義
└── README.md           # このファイル
```

## セットアップ方法

### 1. 依存関係のインストール
```bash
npm install
```

### 2. データベースの初期化
```bash
npm run init-db
```

### 3. サーバーの起動
```bash
npm start
```

または開発モード（自動再起動）:
```bash
npm run dev
```

### 4. アクセス
- メイン画面: http://localhost:3000
- 管理画面: http://localhost:3000/admin

## API エンドポイント

### FAQ取得
- `GET /api/faqs` - 全FAQ取得
- `GET /api/faqs/:id` - ID指定でFAQ取得
- `GET /api/faqs/search/:keyword` - キーワード検索
- `GET /api/faqs/category/:category` - カテゴリ別取得

### FAQ操作
- `POST /api/faqs` - FAQ追加
- `PUT /api/faqs/:id` - FAQ更新
- `DELETE /api/faqs/:id` - FAQ削除

## 使用方法

### FAQ検索
- キーワード入力欄に検索したい言葉を入力
- カテゴリドロップダウンで絞り込み
- FAQ項目をクリックして回答を表示

### FAQ管理
1. 管理画面（/admin）にアクセス
2. 新しいFAQを追加、既存のFAQを編集・削除

## カテゴリ
- インシデント分類
- レポート作成方法
- 緊急時対応
- システム操作
- その他

## 初期データ
システムには以下のサンプルFAQが含まれています：
- インシデントとアクシデントの違い
- レポート提出期限
- 緊急時対応手順
- システムログイン問題
- 匿名レポート提出

## 開発

### 必要な環境
- Node.js 14.0以上
- npm 6.0以上

### 開発用コマンド
```bash
# 開発サーバー起動（自動再起動）
npm run dev

# データベース再初期化
npm run init-db
```

## 注意事項
- SQLiteデータベースファイル（hospital_faq.db）が自動作成されます
- 本格運用時はセキュリティ設定の追加を推奨
- データのバックアップを定期的に取ることを推奨

## ライセンス
このプロジェクトは教育目的で作成されています。