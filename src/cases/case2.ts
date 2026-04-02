import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Post } from "../entity/Post";

// 手動 ON 条件で innerJoinAndSelect → Select はされるが自動マッピングはされない
export async function case2_manualOnJoin() {
  console.log("\n=== Case 2: innerJoinAndSelect with manual ON condition (no auto mapping) ===");

  // Post エンティティを起点に、User を手動 ON で結合する
  // → user プロパティには自動マッピングされない（リレーションパスではないため）
  const results = await AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .innerJoinAndSelect(User, "user", "user.id = post.authorId")
    .getMany();

  for (const post of results) {
    // post.author は undefined になる（自動マッピングされない）
    console.log(`Post: "${post.title}", post.author =`, (post as any).author);
  }
  console.log(
    "→ post.author が undefined なのは、手動 ON では TypeORM がリレーションとして認識しないため"
  );
}
