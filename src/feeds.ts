import { XMLParser } from "fast-xml-parser";
import { readConfig } from "./config.js";
import { createFeed, getFeeds } from "./lib/db/queries/feeds.js";
import { getUserByName } from "./lib/db/queries/users.js";
import type { User, Feed } from "./lib/db/schema.js";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
  if (args.length !== 2) {
    throw new Error(
      `${cmdName} command expects precisely two arguments: name and url`,
    );
  }
  const currentUser = await getUserByName(readConfig().currentUserName);
  if (!currentUser) {
    throw new Error("Login or register as a user to add a feed");
  }
  const [name, url] = args;
  const feed: Feed = await createFeed(name, url, currentUser.id);
  printFeed(feed, currentUser);
}

export async function handlerFeeds(cmdName: string, ...args: string[]) {
  const feeds = await getFeeds();
  feeds.forEach((feed) => {
    console.log(
      `* Name: ${feed.name}\n* URL: ${feed.url}\n* User: ${feed.userId}\n`,
    );
  });
}

function printFeed(feed: Feed, user: User) {
  for (const [key, val] of Object.entries(feed)) {
    console.log(`* ${key}: ${val}`);
  }
  console.log(`* Username: ${user.name}`);
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  // Fetch feed data
  const response = await fetch(feedURL, {
    method: "GET",
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${feedURL}. ${response.status}: ${response.statusText}`,
    );
  }

  const rssFeed = await response.text();

  // Parse the XML
  const parser = new XMLParser({ processEntities: false });
  const parsedXML = parser.parse(rssFeed);

  // Extract the channel field
  const channel = parsedXML.rss?.channel;
  if (channel == null) {
    throw new Error("No channel in XML");
  }

  // Extract the metadata
  const channelTitle = channel.title;
  const channelLink = channel.link;
  const channelDescription = channel.description;
  if (
    typeof channelTitle !== "string" ||
    typeof channelLink !== "string" ||
    typeof channelDescription !== "string"
  ) {
    throw new Error("Missing channel metadata");
  }

  const items = Array.isArray(channel.item)
    ? channel.item
    : channel.item
      ? [channel.item]
      : [];
  const rssItems: RSSItem[] = [];
  for (const item of items) {
    if (
      typeof item.title !== "string" ||
      typeof item.link !== "string" ||
      typeof item.description !== "string" ||
      typeof item.pubDate !== "string"
    ) {
      continue;
    }
    rssItems.push({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    });
  }
  return {
    channel: {
      title: channelTitle,
      link: channelLink,
      description: channelDescription,
      item: rssItems,
    },
  };
}
