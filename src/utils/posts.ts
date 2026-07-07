import { getCollection } from 'astro:content';

/** Published journal posts, newest first. */
export async function getPublishedPosts() {
  const posts = await getCollection('journal', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
