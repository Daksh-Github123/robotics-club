# Handoff guide: running the Tech for Change website

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
| Put a photo behind the homepage    | photo in `src/assets/` + `heroPhoto` in `src/site.config.ts` |
| Add a member quote                 | new file in `src/content/quotes/`           |
| Change the 3 homepage projects     | `featured: true` + `outcome:` in project files |

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

## Collecting project info from students

Students fill in the **[Project Page Template](https://docs.google.com/document/d/1JkOaCIHGlFpuFjT6dEH_IfT5xzVRSfot7AQq1pcarNM/edit)** Google Doc in their own time. They make a copy, fill it in, and put their photos and videos in a shared Drive folder. The last section of the template says which part of the doc goes into which field of the project file below.

Share the template as **View only** so nobody edits the original. Students use File → Make a copy.

Tip: you can paste a finished submission into Claude (or any AI assistant) along with one existing project file and ask it to produce the new project file in the same format. Check the result before committing.

## Add a project

1. Copy a file in `src/content/projects/` (e.g. `sorting-bot.md`) and rename it. The file name becomes the URL: `smart-door.md` → `/projects/smart-door/`.
2. Fill in the top section:

```md
---
title: Smart Door Sensor
tagline: One sentence pitch.
academicYear: "2026-27"            # always in quotes, written like "2026-27"; becomes a filter button
date: 2027-03-01
categories: [Hardware, Software]   # anything you like; these become filter buttons
status: building                   # concept | building | complete | deployed
featured: true                     # true = one of the 3 projects on the homepage (keep it to 3)
outcome: One plain sentence about what it achieved.   # shown on the homepage
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
media:                             # buttons on the project card + page (Drive albums, videos…)
  - label: Photo album
    url: https://drive.google.com/drive/folders/...
    type: photos                   # photos | video | folder | doc | other (sets the icon)
  - label: Demo video
    url: https://youtu.be/...
    type: video
---

## The problem
Write anything here in normal Markdown.

## How it works
...
```

3. Put photos in `public/media/projects/`. Keep images under ~500 KB (use squoosh.app to shrink them). Hover videos should be short (3–6 s), muted, and under ~3 MB. Bigger albums and full-length videos stay on Google Drive or YouTube and go in `media:` as links. Make sure the Drive folder is shared as "Anyone with the link".
4. Delete `placeholder: true` once it's real.

## Homepage photo and member quotes

**Photo behind the homepage.** Put a wide photo (members building or presenting, at least 1800 px wide) in `src/assets/`, then in `src/site.config.ts` set:

```ts
heroPhoto: 'hero.jpg',
heroPhotoAlt: 'Two members soldering wires on a robot car',
```

The site resizes and compresses it automatically. Faces work best in the upper half of the photo, because the headline sits at the bottom-left. Leave `heroPhoto: ''` for a plain hero.

**Member quotes.** Each quote is a file in `src/content/quotes/`. The homepage shows the first three by `order`. Replace the placeholder files:

```md
---
name: Ananya
grade: Grade 9
project: Smart Dustbin
text: One or two sentences in the member's own words.
order: 1
---
```

Use their real words, lightly trimmed. Ask before publishing anyone's name.

Also swap the "Photo coming soon: members at work" block in the "Run by students" section of `src/pages/index.astro` for a real photo when you have one.

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

Everything respects the "reduce motion" accessibility setting: visitors who turn it on get a calm, static version.

## Hosting: Vercel

- The site is a Vercel project connected to this GitHub repo. Pushes to `main` deploy to production; other branches get preview links.
- **Handing over:** add the next maintainer as a collaborator on GitHub (Settings → Collaborators) and transfer or share the Vercel project (Vercel → Project → Settings → Members, or transfer the project to their account).
- **Custom domain:** buy a domain (e.g. from Vercel, Namecheap or Cloudflare), then Vercel → Project → Settings → Domains → Add. Vercel shows the DNS records to set. Afterwards, put the domain in `site:` in `astro.config.mjs`.
