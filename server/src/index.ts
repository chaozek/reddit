import "reflect-metadata";
import "dotenv-safe/config";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/Post";
import { UserResolver } from "./resolvers/User";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import Redis from "ioredis";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { createConnection } from "typeorm";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";
const main = async () => {
  try {
    const conn = await createConnection({
      type: "postgres",
      url: __prod__ ? process.env.DATABASE_URL : undefined,
      logging: true,
      synchronize: false,
      host: "164.92.190.39",
      port: 18169,
      username: "postgres",
      password: "3b23100510b28375441a2d6790075327",
      database: "hummus3",
      /*    migrations: [path.join(__dirname, "./migrations/*")], */
      entities: [Post, User, Updoot],
      migrationsRun: true,
      /*   migrationsTransactionMode: "each", */
    });
    /*  await Post.delete({}); */
    /*     console.log("___BEFORE____");
    await conn.runMigrations();
    console.log("___AFTER____"); */

    const app = express();
    app.set("trust proxy", true);
    app.use(
      cors({
        origin: [
          process.env.CORS_ORIGIN,
          "http://localhost:3001",
          "https://studio.apollographql.com",
        ],
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
    let redis = new Redis(process.env.REDIS_URL);

    redis.connect().catch(console.error);
    let RedisStore = connectRedis(session);
    app.use(
      session({
        name: COOKIE_NAME,
        store: new RedisStore({
          client: redis as any,
          /*   disableTTL: true, */
          disableTouch: true,
        }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
          httpOnly: true,
          secure: __prod__ ? true : false, //false for localhost
          sameSite: "lax", //lax for localhost // none
          domain: ".pavelkaplan.eu",
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
      })
    );

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [PostResolver, UserResolver],
        validate: false,
      }),
      context: ({ req, res }) => ({
        req,
        res,
        redis,
        userLoader: createUserLoader(),
        updootLoader: createUpdootLoader(),
      }),
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(parseInt(process.env.PORT), () => {
      console.log("EXPRESS SERVER IS RUNNING");
    });
  } catch (error) {
    console.log(error, "ERRR");
  }
};

main();
