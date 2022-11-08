import { createUpdootLoader } from "./utils/createUpdootLoader";
import { Request, Response } from "express";
import { createUserLoader } from "./utils/createUserLoader";
import { Redis } from "ioredis";

export type MyContext = {
  // @ts-ignore
  req: Request & { session: Express.Session };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
