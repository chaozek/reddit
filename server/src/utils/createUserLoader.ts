import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    console.log(users, "USERSS");
    const userIdToUser: Record<number, User> = [];
    users.forEach((u) => {
      console.log(userIdToUser[u.id], "?");
      userIdToUser[u.id] = u;
    });
    console.log(userIdToUser, "userIdToUser");

    return userIds.map((userId) => userIdToUser[userId]);
  });
