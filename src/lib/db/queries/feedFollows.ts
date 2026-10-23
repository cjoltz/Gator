import { and, eq, getTableColumns } from "drizzle-orm";
import { db } from "../index.js";
import { feedFollows, feeds, users } from "../schema.js";
import { getFeedByURL } from "./feeds.js";

export async function createFeedFollow(userId: string, feedId: string) {
  const [insertResult] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .returning();

  const [result] = await db
    .select({
      ...getTableColumns(feedFollows),
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.id, insertResult.id));
  return result;
}

export async function getFeedFollowsForUser(userId: string) {
  return await db
    .select({
      ...getTableColumns(feedFollows),
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(users.id, feedFollows.userId))
    .innerJoin(feeds, eq(feeds.id, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId));
}

export async function unfollowFeedByURL(url: string, userId: string) {
  const feed = await getFeedByURL(url);
  // deletes a feed follow row
  return await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.feedId, feed.id), eq(feedFollows.userId, userId)))
    .returning();
}
