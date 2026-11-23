// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // When you buy a domain, put it here (e.g. 'https://ourrobotics.club').
  // site: 'https://robotics-club.vercel.app',
  prefetch: true,
  vite: {
    // three.js (the 3D hero gear) is ~130 KB gzipped and loads lazily after the page is idle.
    build: { chunkSizeWarningLimit: 600 },
  },
});
