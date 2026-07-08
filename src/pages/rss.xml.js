import rss from '@astrojs/rss';
import { getPublishedPosts } from '../utils/posts';

export async function GET(context) {
  const posts = await getPublishedPosts();

  return rss({
    title: 'cisel dsouza — the decodes',
    description: "Monthly breakdowns of the marketing, branding and psychology behind the brands everyone's talking about.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/decodes/${post.id}/`,
    })),
  });
}
