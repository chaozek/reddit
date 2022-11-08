import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { v4 } from "uuid";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { sendEmail } from "../utils/sendEmail";
import { getConnection } from "typeorm";
import { COOKIE_NAME } from "../constants";
@InputType()
class UsernamePasswordInput {
  @Field(() => String)
  email: string;
  @Field()
  username: string;
  @Field(() => String)
  password: string;
}
@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (user.email == req.session.userId) {
      return user.email;
    }
    return "";
  }

  @Mutation(() => UserResponse, { nullable: true })
  async changePassword(
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    console.log(newPassword, "NEWPASS");
    if (newPassword.length <= 2) {
      return {
        errors: [{ field: "newPassword", message: "Password not long enough" }],
      };
    }
    const userId = await redis.get("forget-password" + token);
    if (!userId) {
      return {
        errors: [{ field: "token", message: "token expired" }],
      };
    }
    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [{ field: "token", message: "User no longer exists" }],
      };
    }
    req.session.userId = user.id;
    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );
    await redis.del("forget-password" + token);
    return { user };
  }
  @Mutation(() => Boolean, { nullable: true })
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    console.log("HIT");
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    const token = v4();

    await redis.set(
      "forget-password" + token,
      user.id,
      "EX",
      1000 * 60 * 60 * 24 * 3
    );

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    if (options.email.length <= 2) {
      return {
        errors: [{ field: "email", message: "Email not long enough" }],
      };
    }
    if (!options.email.includes("@")) {
      return {
        errors: [{ field: "email", message: "This is not the email" }],
      };
    }
    if (options.username.includes("@")) {
      return {
        errors: [{ field: "email", message: "Cannot include @" }],
      };
    }
    if (options.username.length <= 2) {
      return {
        errors: [{ field: "username", message: "Username not long enough" }],
      };
    }
    if (options.password.length <= 2) {
      return {
        errors: [{ field: "password", message: "Password not long enough" }],
      };
    }
    const hashedPassword = await argon2.hash(options.password);

    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPassword,
          email: options.email,
        })
        .returning("*")
        .execute();

      user = result.raw[0];
    } catch (error) {
      console.log(error, "ERR");
      if (error.code === "23505" || error?.detail.includes("already exists")) {
        return {
          errors: [{ field: "username", message: "Username already exists" }],
        };
      }
    }
    req.session!.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    if (!user) {
      return {
        errors: [{ field: "usernameOrEmail", message: "Username not found" }],
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "Incorrect Paswword" }],
      };
    }
    req.session!.userId = user.id;
    console.log(req.session.userId, "REQQQ");
    return {
      user,
    };
  }
  @Mutation(() => Boolean)
  async logout(@Ctx() { res, req }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err: any) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }
}
