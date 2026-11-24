# Tech for Change website

The home of Tech for Change, the student-led robotics and tech club at Inventure Academy: every project we build, the club's journey so far, and how to join.

Built with [Astro](https://astro.build), GSAP, Lenis and Three.js. Hosted on Vercel.

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
```

## Updating content

Projects, milestones, members and competitions are Markdown files in `src/content/`.
Club-wide settings live in `src/site.config.ts`.

**New maintainer? Read [HANDOFF.md](./HANDOFF.md).** It covers adding milestones and projects, swapping out placeholders, and moving hosting/domains.

## Pages

| Route                | What it is                                                       |
| -------------------- | ---------------------------------------------------------------- |
| `/`                  | Hero, stats, scroll-driven timeline, project strip, why join, CTA |
| `/projects/`         | Filterable bento grid of every project                           |
| `/projects/[slug]/`  | One page per project                                             |
| `/team/`             | Founders, current leads, alumni                                  |
| `/competitions/`     | Pathway onto school teams, competitions & results                |
| `/join/`             | How to apply, FAQ, contacts                                      |
| `/sponsors/`         | Hidden until `features.showSponsors` is `true`                   |
