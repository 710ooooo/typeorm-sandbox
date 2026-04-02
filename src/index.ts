import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Post } from "./entity/Post";
import { case1_relationJoin } from "./cases/case1";
import { case2_manualOnJoin } from "./cases/case2";

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

async function main() {
  await AppDataSource.initialize();
  console.log("DB connected.");

  await seed();

  await case1_relationJoin();
  await case2_manualOnJoin();

  await AppDataSource.destroy();
}

main().catch(console.error);
