import { User } from "../entities/User";
import { MyContext } from "./../types";
import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Int,
  Mutation,
  Field,
  InputType,
  UseMiddleware,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { Post } from "../entities/Post";
import isAuth from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });
    return updoot ? updoot.value : null;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    /*    await sleep(3000); */

    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne];
    /*   if (req.session.userId) {
      replacements.push(req.session.userId);
    } */
    console.log(replacements, "REPS");
    const posts = await getConnection().query(
      `
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < ${req.session.userId}` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined | null> {
    return Post.findOne({ where: { id } /* , relations: ["creator"] */ });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const { userId } = req.session;
    console.log(userId, " IDDD");
    const updoot = await Updoot.findOne({ where: { postId, userId } });

    const isUpdoot = value !== -1;
    const _value = isUpdoot ? 1 : -1;
    if (updoot && updoot.value !== _value) {
      await getConnection().transaction(async (tm) => {
        tm.query(`
        UPDATE updoot
        SET value =  ${_value}
        WHERE "postId" = ${postId} and "userId" = ${userId}
        `);
        await tm.query(`
        UPDATE post
        SET points = points + ${2 * _value}
        WHERE id = ${postId};
        `);
      });
    } else if (!updoot) {
      await getConnection().transaction(async (tm: any) => {
        await tm.query(`
        INSERT INTO updoot (value, "userId", "postId")
        VALUES (${_value}, ${userId}, ${postId});
        `);
        await tm.query(`
        UPDATE post
        SET points = points + ${_value}
        WHERE id = ${postId};
        `);
      });
    }
    return true;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean | null> {
    const post = await Post.findOne(id);

    if (!post) {
      return false;
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error("Not authorized to delete post");
    }
    /*     await getConnection().transaction(async (tm) => {
      tm.query(`
      DELETE FROM updoot 
      WHERE "postId" = ${id};
      `);
      tm.query(`
      DELETE FROM post 
      WHERE id = ${id} AND "creatorId" = ${req.session.userId};
      `);
    }); */
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
