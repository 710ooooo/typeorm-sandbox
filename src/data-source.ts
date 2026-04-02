import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Post } from "./entity/Post";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "sandbox",
  password: "sandbox",
  database: "sandbox",
  synchronize: true,
  logging: ["query"],
  entities: [User, Post],
});
