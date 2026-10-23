import { fetchFeed } from "./feeds.js";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  const url = "https://www.wagslane.dev/index.xml";
  const rssfeed = await fetchFeed(url);
  console.dir(rssfeed, { depth: null });
}
