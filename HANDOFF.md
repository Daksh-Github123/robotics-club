# Handoff guide: running the Robotics Club website

This guide is for whoever maintains the site next. You don't need to be a web developer.
Almost everything you'll ever change is a **text file** in `src/content/` or `src/site.config.ts`.

Every time you push a change to the `main` branch on GitHub, Vercel rebuilds and publishes the site automatically (about 1 minute).

---

## The 30-second version

| I want to…                         | Edit this                                   |
| ---------------------------------- | ------------------------------------------- |
| Add a milestone to the timeline    | new file in `src/content/milestones/`       |
| Add a project                      | new file in `src/content/projects/`         |
| Add / update a member              | file in `src/content/members/`              |
| Add a competition or result        | file in `src/content/competitions/`         |
| Change club name, meeting time etc | `src/site.config.ts`                        |
| Edit the FAQ                       | `src/data/faq.ts`                           |
| Change colors or fonts             | `src/styles/tokens.css`                     |
| Show the Sponsors page             | set `showSponsors: true` in `src/site.config.ts` |

You can edit files directly on github.com (open the file → pencil icon → "Commit changes"). That's enough for content updates.

---

## Add a milestone

1. Go to `src/content/milestones/` and copy any existing file.
2. Name it with the next number, e.g. `07-first-funding.md`.
3. Edit the top section:

```md
---
title: We got our first funding!
date: 2027-02-10
type: funding
summary: One sentence about what happened. Shows on the timeline card.
---
```

`type` controls the icon and color. It must be one of:
`founding`, `sprint`, `showcase`, `funding`, `competition`, `deployment`, `other`.

Dates in the future show as "Upcoming". The timeline sorts itself by date, so file names don't matter for order.

## Add a project

1. Copy a file in `src/content/projects/` (e.g. `sorting-bot.md`) and rename it. The file name becomes the URL: `smart-door.md` → `/projects/smart-door/`.
2. Fill in the top section:

```md
---
title: Smart Door Sensor
tagline: One sentence pitch.
sprint: 4
date: 2027-03-01
categories: [Hardware, Software]   # anything you like; these become filter buttons
status: building                   # concept | building | complete | deployed
featured: true                     # true = shows in the homepage strip
size: normal                       # normal | wide | tall | large (tile size on /projects)
cover: /media/projects/smart-door.jpg
video: /media/projects/smart-door.mp4   # optional, plays on hover
gallery:
  - /media/projects/smart-door-1.jpg
  - /media/projects/smart-door-2.jpg
team: [Alex Kim, Sam Patel]
tech: [ESP32, Reed switch]
links:
  - label: Code on GitHub
    url: https://github.com/...
---

## The problem
Write anything here in normal Markdown.

## How it works
...
```

3. Put photos in `public/media/projects/`. Keep images under ~500 KB (use squoosh.app to shrink them). Hover videos should be short (3–6 s), muted, and under ~3 MB.
4. Delete `placeholder: true` once it's real.

## Members

Each person is one file in `src/content/members/`.

- `status: current` shows them under "Running the club"; `status: alumni` moves them to the alumni section.
- **When someone graduates, just change `status: current` to `status: alumni`.** Don't delete them; the alumni list is part of the club's story.
- Add a `contact:` block (email / instagram / discord / linkedin) to list them on the Join page as someone students can message.
- Photos go in `public/media/members/` and are referenced as `photo: /media/members/name.jpg` (square images work best).

## Remove the placeholders

Everything marked `placeholder: true` (and every `TODO` in `src/site.config.ts` and `src/data/faq.ts`) is example content. Search the project for `placeholder: true` and `TODO` to find them all.

---

## Running the site on your own computer (optional)

Only needed for bigger changes (layout, new sections).

1. Install [Node.js](https://nodejs.org) (the LTS version).
2. In a terminal, inside this folder:

```bash
npm install      # first time only
npm run dev      # opens a live preview at http://localhost:4321
```

3. `npm run build` checks everything compiles. If a content file has a typo (like `status: done`), the error message names the exact file and field.

## How the site is built

- **Astro**: turns the content files into fast static pages.
- **GSAP + ScrollTrigger**: scroll animations (timeline line, sideways project strip, reveals).
- **Lenis**: smooth scrolling.
- **WebGL fluid sim** (`src/scripts/fluid.ts`): the liquid background that follows the cursor. Tweak `CONFIG` at the top to change how long the ink lasts or how strong it is.
- **Three.js** (`src/scripts/hero3d.ts`): the spinning 3D gears on the homepage.

Everything respects the "reduce motion" accessibility setting: visitors who turn it on get a calm, static version.

## Hosting: Vercel

- The site is a Vercel project connected to this GitHub repo. Pushes to `main` deploy to production; other branches get preview links.
- **Handing over:** add the next maintainer as a collaborator on GitHub (Settings → Collaborators) and transfer or share the Vercel project (Vercel → Project → Settings → Members, or transfer the project to their account).
- **Custom domain:** buy a domain (e.g. from Vercel, Namecheap or Cloudflare), then Vercel → Project → Settings → Domains → Add. Vercel shows the DNS records to set. Afterwards, put the domain in `site:` in `astro.config.mjs`.
