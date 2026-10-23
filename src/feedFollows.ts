import { url } from "node:inspector";
import { readConfig } from "./config.js";
import {
  createFeedFollow,
  getFeedFollowsForUser,
  unfollowFeedByURL,
} from "./lib/db/queries/feedFollows.js";
import { getFeedByURL } from "./lib/db/queries/feeds.js";
import { getUserByName } from "./lib/db/queries/users.js";
import { User } from "./lib/db/schema.js";

export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  // Command a logged in user uses to follow a feed (url)
  if (args.length !== 1) {
    throw new Error(`${cmdName} expects exactly 1 argument: a feed url`);
  }
  const url = args[0];
  const feed = await getFeedByURL(url);
  const result = await createFeedFollow(user.id, feed.id);
  console.log(`User ${result.userName} now follows ${result.feedName}`);
}

export async function handlerFollowing(cmdName: string, user: User) {
  const feeds = await getFeedFollowsForUser(user.id);
  if (feeds.length === 0) {
    console.log(
      `${user.name} doesn't follow any feeds yet. Use follow command to start!`,
    );
    return;
  }
  console.log(`${user.name} currently follows: `);
  feeds.forEach((feed) => {
    console.log(`* ${feed.feedName}`);
  });
}

export function printFeedFollow(username: string, feedname: string) {
  console.log(`* User: ${username}`);
  console.log(`* Feed: ${feedname}`);
}

export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <feedname>`);
  }

  let result = await unfollowFeedByURL(args[0], user.id);
  if (result.length === 0) {
    throw new Error(`${user.name} doesn't follow this feed.`);
  }
  console.log(`${user.name} has unfollowed the feed ${args[0]}.`);
}
