// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // When you buy a domain, put it here (e.g. 'https://techforchange.club').
  // site: 'https://tech-for-change.vercel.app',
  prefetch: true,
  // Old pages now live on the About page
  redirects: {
    '/team': '/about/#people',
    '/competitions': '/about/#competitions',
  },
});
