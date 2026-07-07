import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string().min(1),
    // meta/OG description — search and social truncate around 160 chars
    description: z.string().min(1).max(160),
    date: z.coerce.date(),
    tag: z.enum(['brand strategy', 'marketing', 'ecommerce', 'growth']),
    draft: z.boolean().default(false),
  }),
});

export const collections = { journal };
