import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Post } from "./entity/Post";
import { case1_relationJoin } from "./cases/case1";
import { case2_manualOnJoin } from "./cases/case2";
import { case3_doubleTransform } from "./cases/case3";

async function seed() {
  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.count();
  if (existing > 0) return;

  const alice = userRepo.create({ name: "Alice" });
  const bob = userRepo.create({ name: "Bob" });
  await userRepo.save([alice, bob]);

  const postRepo = AppDataSource.getRepository(Post);
  await postRepo.save([
    postRepo.create({ title: "Alice's post 1", authorId: alice.id }),
    postRepo.create({ title: "Alice's post 2", authorId: alice.id }),
    postRepo.create({ title: "Bob's post 1", authorId: bob.id }),
  ]);

  console.log("Seeded.");
}

const CASES_WITHOUT_DB = new Set(["case3"]);

async function main() {
  const target = process.argv[2]; // e.g. "case1", "case2", "case3"

  const needsDb = !target || !CASES_WITHOUT_DB.has(target);

  if (needsDb) {
    await AppDataSource.initialize();
    console.log("DB connected.");
    await seed();
  }

  if (!target || target === "case1") await case1_relationJoin();
  if (!target || target === "case2") await case2_manualOnJoin();
  if (!target || target === "case3") await case3_doubleTransform();

  if (needsDb) await AppDataSource.destroy();
}

main().catch(console.error);
