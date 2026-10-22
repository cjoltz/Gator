import { XMLParser } from "fast-xml-parser";

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
