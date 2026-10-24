import { getPostsForUser } from "./lib/db/queries/posts.js";
import { Post, User } from "./lib/db/schema.js";

export async function handlerBrowse(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  // Optional limit arg defaults to 2
  const inLimit = parseInt(args[0]);
  const limit = !isNaN(inLimit) && inLimit > 0 ? inLimit : 2;

  const posts = await getPostsForUser(user.id, limit);
  for (const post of posts) {
    printPost(post);
  }
}

function printPost(post: Post) {
  console.log(`* TITLE: ${post.title}`);
  console.log(`  - DESCRIPTION: ${post.description}`);
  console.log(`  - URL: ${post.url}`);
  console.log(`  - PUBLISHED DATE: ${post.publishedAt}`);
}
