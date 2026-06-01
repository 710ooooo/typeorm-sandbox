/**
 * Case 3: @Transform アノテーションを持つ DTO を継承すると変換が2回実行される問題
 *
 * class-transformer の plainToInstance はプロトタイプチェーンを辿って
 * @Transform を収集するため、子クラスで同じプロパティに @Transform を
 * 再定義すると親・子の両方から収集され、合計2回適用される。
 */

import "reflect-metadata";
import { Transform, plainToInstance } from "class-transformer";

// ─── 親 DTO ──────────────────────────────────────────────────────────────

class BaseUserDto {
  @Transform(({ value }) => String(value).trim().toUpperCase())
  name!: string;
}

// ─── パターン A: 継承のみ（@Transform 再定義なし） ───────────────────────
// → 親の @Transform が1回だけ実行される（正常）

class CreateUserDto extends BaseUserDto {
  // @Transform を追加しない
}

// ─── パターン B: 継承 + 子で同じ @Transform を再定義 ─────────────────────
// → 子に登録 + 親に登録 で合計2回実行される（バグの温床）

class AdminUserDto extends BaseUserDto {
  @Transform(({ value }) => String(value).trim().toUpperCase()) // 親と同じ変換を再定義
  name!: string;
}

// ─── パターン C: 非冪等な変換で実害が出るケース ──────────────────────────
// 価格に消費税(10%)を加算する変換。2回実行されると 1.1^2 = 1.21倍になる

class PriceBaseDto {
  @Transform(({ value }) => Math.round(Number(value) * 1.1))
  price!: number;
}

class PriceChildDto extends PriceBaseDto {
  @Transform(({ value }) => Math.round(Number(value) * 1.1)) // 同じ変換を子で再定義
  price!: number;
}

// ─── 実行 ────────────────────────────────────────────────────────────────

export async function case3_doubleTransform() {
  console.log("\n=== Case 3: @Transform 継承による二重実行問題 (class-transformer 本物) ===\n");

  // パターン A: 1回だけ実行（正常）
  console.log("--- [A] CreateUserDto: 継承のみ、@Transform 再定義なし ---");
  const a = plainToInstance(CreateUserDto, { name: "  alice  " });
  console.log(`  => name = "${a.name}"  (期待: "ALICE" ← 1回実行)\n`);

  // パターン B: 2回実行（冪等な変換なので結果は同じだが処理は2度走る）
  console.log("--- [B] AdminUserDto: 継承 + 子で同じ @Transform を再定義 ---");
  const b = plainToInstance(AdminUserDto, { name: "  alice  " });
  console.log(`  => name = "${b.name}"  (2回実行されたが冪等のため値は変わらない)\n`);

  // パターン C: 非冪等な変換で二重実行の実害が出るケース
  console.log("--- [C] PriceChildDto: 非冪等な変換（税10%加算）が2回適用される ---");
  const basePrice = plainToInstance(PriceBaseDto, { price: 1000 });
  console.log(`  PriceBaseDto  => price = ${basePrice.price}  (期待: 1100 = 1000 * 1.1)`);
  const childPrice = plainToInstance(PriceChildDto, { price: 1000 });
  console.log(`  PriceChildDto => price = ${childPrice.price}  (バグ: 1210 = 1000 * 1.1 * 1.1)\n`);

  console.log("--- [まとめ] ---");
  console.log("class-transformer はプロトタイプチェーンを辿って @Transform を収集する。");
  console.log("子クラスで同じプロパティに @Transform を再定義すると");
  console.log("子と親の両方に登録されたtransformが実行され、合計2回適用される。");
  console.log("冪等な変換(trim/toUpperCase)では気づきにくいが、");
  console.log("税計算のような非冪等な変換では予期しない値になる。");
}
