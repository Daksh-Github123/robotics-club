/**
 * Content schemas. These describe what each content file must contain.
 * If you make a typo in a content file (e.g. a wrong status), the build
 * will fail with a message telling you exactly which file and field.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const milestones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/milestones' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z
      .enum(['founding', 'sprint', 'showcase', 'funding', 'competition', 'deployment', 'other'])
      .default('other'),
    summary: z.string(),
    link: z.string().optional(),
    placeholder: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    /** School year the project belongs to, written like "2025-26". */
    academicYear: z.string().regex(/^\d{4}-\d{2}$/, 'Write the academic year like "2025-26"'),
    date: z.coerce.date(),
    categories: z.array(z.string()).default([]),
    status: z.enum(['concept', 'building', 'complete', 'deployed']).default('building'),
    featured: z.boolean().default(false),
    /** How big the tile is on the Projects page grid. */
    size: z.enum(['normal', 'wide', 'tall', 'large']).default('normal'),
    /** Path to an image in /public, e.g. /media/projects/sorting-bot.jpg */
    cover: z.string().optional(),
    /** Optional short muted clip that plays on hover, e.g. /media/projects/sorting-bot.mp4 */
    video: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    team: z.array(z.string()).default([]),
    tech: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    /**
     * Extra photos/videos hosted elsewhere (Google Drive, YouTube…).
     * Shown as buttons on the project card and the project page.
     */
    media: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
          type: z.enum(['photos', 'video', 'folder', 'doc', 'other']).default('other'),
        }),
      )
      .default([]),
    placeholder: z.boolean().default(false),
  }),
});

const members = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/members' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    status: z.enum(['current', 'alumni']).default('current'),
    gradYear: z.number().int().optional(),
    founder: z.boolean().default(false),
    /** Lower numbers show first. */
    order: z.number().default(50),
    photo: z.string().optional(),
    bio: z.string().optional(),
    contact: z
      .object({
        email: z.string().optional(),
        instagram: z.string().optional(),
        discord: z.string().optional(),
        linkedin: z.string().optional(),
      })
      .optional(),
    placeholder: z.boolean().default(false),
  }),
});

const competitions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/competitions' }),
  schema: z.object({
    name: z.string(),
    level: z.string(),
    description: z.string(),
    website: z.string().optional(),
    order: z.number().default(50),
    results: z.array(z.object({ year: z.union([z.number(), z.string()]), result: z.string() })).default([]),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { milestones, projects, members, competitions };
