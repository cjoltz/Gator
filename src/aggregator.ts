import { fetchFeed } from "./feeds.js";
import { getNextFeedtoFetch, markFeedFetched } from "./lib/db/queries/feeds.js";
import { createPost } from "./lib/db/queries/posts.js";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(
      `usage: ${cmdName} <time_between_reqs>. time_between_reqs is a duration string (number followed by either ms,s,m,h), e.g. 100ms, 1s, 2m, 3h, etc.`,
    );
  }
  const minTimeBetweenRequest = 100; // ms
  const timeBetweenRequests = parseDuration(args[0]);
  if (timeBetweenRequests < minTimeBetweenRequest) {
    throw new Error("Interval too small");
  }
  // Fetch first feed immediately
  scrapeFeeds().catch((err) => {
    console.error(err);
  });

  // the periodically fetch feeds after interval
  const interval = setInterval(() => {
    scrapeFeeds().catch((err) => {
      console.error(err);
    });
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export async function scrapeFeeds() {
  const [nextFeed] = await getNextFeedtoFetch();
  if (!nextFeed) {
    throw new Error("No feeds added yet");
  }
  await markFeedFetched(nextFeed.id);
  const fetchedFeed = await fetchFeed(nextFeed.url);

  for (const item of fetchedFeed.channel.item) {
    // On a bad publication Date, default to current time
    let date = new Date(item.pubDate);
    if (isNaN(date.getTime())) {
      date = new Date();
    }

    try {
      await createPost(
        item.title,
        item.link,
        item.description,
        date,
        nextFeed.id,
      );
    } catch (err) {
      console.error(`Failed to save post ${item.link}`, err);
    }
  }
}

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match || match.length !== 3) {
    throw new Error("Invalid duration string");
  }
  const num = parseInt(match[1]);
  const unit = match[2];

  console.log(`Collecting feeds every ${num}${unit}`);

  switch (unit) {
    case "ms":
      return num;
    case "s":
      return num * 1000;
    case "m":
      return num * 1000 * 60;
    default:
      return num * 1000 * 60 * 60;
  }
}
