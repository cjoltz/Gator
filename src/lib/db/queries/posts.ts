import { desc, eq, getTableColumns } from "drizzle-orm";
import { db } from "../index.js";
import { feedFollows, Post, posts } from "../schema.js";

export async function createPost(
  title: string,
  url: string,
  description: string,
  publishedAt: Date,
  feedId: string,
) {
  const [result] = await db
    .insert(posts)
    .values({
      title,
      url,
      description,
      publishedAt,
      feedId,
    })
    .onConflictDoNothing({ target: posts.url })
    .returning();

  return result;
}

export async function getPostsForUser(
  userId: string,
  limit: number,
): Promise<Post[]> {
  return await db
    .select({ ...getTableColumns(posts) })
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}
