import { db } from "../index.js";
import { feeds, users } from "../schema.js";
import { asc, eq, sql } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId,
    })
    .returning();
  return result;
}

export async function getFeeds() {
  return await db
    .select({ name: feeds.name, url: feeds.url, userName: users.name })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}

export async function getFeedByURL(url: string) {
  let [feed] = await db.select().from(feeds).where(eq(feeds.url, url));
  return feed;
}

export async function markFeedFetched(feedId: string) {
  const [result] = await db
    .update(feeds)
    .set({ updatedAt: sql`NOW()`, lastFetchedAt: sql`NOW()` })
    .where(eq(feeds.id, feedId))
    .returning();
  return result;
}

export async function getNextFeedtoFetch() {
  return await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} asc nulls first`)
    .limit(1);
}
