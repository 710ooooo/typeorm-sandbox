# TypeORM v3 QueryBuilder サンドボックス

TypeORM v3 の QueryBuilder における `innerJoinAndSelect` の挙動を検証するサンドボックスです。

## 検証テーマ

**リレーション定義ありの結合** と **手動 ON 条件による結合** で、自動マッピングの挙動がどう変わるかを確認します。

## エンティティ構成

```
User (1) ──── (N) Post
  id               id
  name             title
  posts[]          authorId (FK)
                   author
```

- `User` は `@OneToMany` で `posts` を持つ
- `Post` は `@ManyToOne` で `author` (User) を持つ

## ケース一覧

### Case 1: リレーションパスによる innerJoinAndSelect（自動マッピングあり）

**ファイル:** [src/cases/case1.ts](src/cases/case1.ts)

```ts
AppDataSource.getRepository(User)
  .createQueryBuilder("user")
  .innerJoinAndSelect("user.posts", "post")  // エンティティのリレーション名を指定
  .getMany();
```

- 第1引数に `"user.posts"` というリレーションパス文字列を渡す
- TypeORM がリレーション定義を解釈し、JOIN 後のデータを `user.posts[]` に自動マッピングする
- `getMany()` で取得した `User` インスタンスの `posts` プロパティに `Post[]` が入っている

**結果:** `user.posts` にデータがマッピングされる ✅

---

### Case 2: 手動 ON 条件による innerJoinAndSelect（自動マッピングなし）

**ファイル:** [src/cases/case2.ts](src/cases/case2.ts)

```ts
AppDataSource.getRepository(Post)
  .createQueryBuilder("post")
  .innerJoinAndSelect(User, "user", "user.id = post.authorId")  // エンティティクラスと ON 文字列を直接指定
  .getMany();
```

- 第1引数にエンティティクラス (`User`)、第3引数に ON 条件文字列を渡す
- SQL 上は `INNER JOIN user ON user.id = post.authorId` が発行され、`user.*` の SELECT も行われる
- しかし TypeORM はこれをリレーションとして認識しないため、`post.author` への自動マッピングは行われない
- `post.author` は `undefined` になる

**結果:** `post.author` は `undefined` ❌（SQL は正しく JOIN されているが、マッピングされない）

---

## まとめ

| 方法 | 構文 | SQL JOIN | 自動マッピング |
|------|------|----------|--------------|
| リレーションパス | `innerJoinAndSelect("user.posts", "post")` | ✅ | ✅ |
| 手動 ON 条件 | `innerJoinAndSelect(User, "user", "...")` | ✅ | ❌ |

手動 ON 条件を使う場合は `getRawMany()` で生データとして取得し、自前でマッピングする必要があります。

## セットアップ・実行

```bash
# MySQL を Docker で起動
docker compose up -d

# 依存パッケージのインストール
npm install

# 実行
npm start
```

## 構成

```
.
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # 起動・シード・ケース呼び出し
    ├── data-source.ts    # DataSource 設定
    ├── entity/
    │   ├── User.ts
    │   └── Post.ts
    └── cases/
        ├── case1.ts      # リレーション経由の innerJoinAndSelect
        └── case2.ts      # 手動 ON 条件の innerJoinAndSelect
```
