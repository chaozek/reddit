import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  console.log(context.req.session, "SESS");
  if (!context.req.session.userId) {
    throw new Error("not authenticated");
  }
  return next();
};

export default isAuth;
