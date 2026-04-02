import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

// リレーション定義を使った innerJoinAndSelect → 自動マッピングされる
export async function case1_relationJoin() {
  console.log("\n=== Case 1: innerJoinAndSelect via relation (auto mapping) ===");

  const results = await AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .innerJoinAndSelect("user.posts", "post")
    .getMany();

  for (const user of results) {
    console.log(`User: ${user.name}, posts:`, user.posts.map((p) => p.title));
  }
  // user.posts には Post[] がマッピングされている
}
