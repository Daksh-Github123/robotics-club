/**
 * Site-wide motion: smooth scrolling, scroll reveals, counters,
 * magnetic buttons, card tilt and hover glow.
 * Loaded once on every page from the Base layout.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;

/** Shared scroll speed, read by the 3D hero to spin faster while scrolling. */
export const scrollState = { velocity: 0 };

/* ───────── Smooth scrolling ───────── */
export let lenis: Lenis | null = null;
if (!reducedMotion) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
(window as unknown as { __lenis: Lenis | null }).__lenis = lenis;

/* In-page anchor links (e.g. "Our journey") glide instead of jumping. */
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const target = document.querySelector(url.hash);
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -70 });
  else target.scrollIntoView();
  history.replaceState(null, '', url.hash);
});
window.addEventListener('load', () => {
  if (!location.hash) return;
  const target = document.querySelector(location.hash);
  if (target && lenis) setTimeout(() => lenis!.scrollTo(target as HTMLElement, { offset: -70, immediate: true }), 50);
});

/* ───────── Scroll reveals ───────── */
if (!reducedMotion) {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 44, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.1,
        delay: parseFloat(el.dataset.revealDelay || '0'),
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      },
    );
  });

  // Children of [data-reveal-group] animate in one after another.
  gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
    gsap.fromTo(
      group.children,
      { y: 50, opacity: 0, scale: 0.96 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 88%', once: true },
      },
    );
  });
}

/* ───────── Number counters ───────── */
document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
  const end = Number(el.dataset.count);
  if (reducedMotion || !Number.isFinite(end)) return;
  el.textContent = '0';
  const counter = { v: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 92%',
    once: true,
    onEnter: () =>
      gsap.to(counter, {
        v: end,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = String(Math.round(counter.v));
        },
      }),
  });
});

/* ───────── Scroll velocity (skews marquees, spins the gear) ───────── */
{
  let target = 0;
  let current = 0;
  const skewEls = gsap.utils.toArray<HTMLElement>('[data-velocity-skew]');
  ScrollTrigger.create({
    onUpdate: (self) => {
      scrollState.velocity = self.getVelocity();
      target = gsap.utils.clamp(-10, 10, self.getVelocity() / -320);
    },
  });
  gsap.ticker.add(() => {
    scrollState.velocity *= 0.92;
    target *= 0.9;
    current += (target - current) * 0.12;
    if (!reducedMotion && skewEls.length) skewEls.forEach((el) => gsap.set(el, { skewX: current }));
  });
}

/* ───────── Pointer-only effects ───────── */
if (finePointer && !reducedMotion) {
  // Magnetic buttons
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });

  // 3D tilt + hover video
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const video = card.querySelector<HTMLVideoElement>('video[data-hover-video]');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', `${((0.5 - py) * 9).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((px - 0.5) * 11).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerenter', () => {
      if (video) {
        card.classList.add('is-playing');
        video.play().catch(() => {});
      }
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      if (video) {
        card.classList.remove('is-playing');
        video.pause();
      }
    });
  });
}

/* Cursor-following glow inside cards (works with touch too) */
document.querySelectorAll<HTMLElement>('[data-glow]').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', `${e.clientX - r.left}px`);
    el.style.setProperty('--gy', `${e.clientY - r.top}px`);
  });
});

// Fonts and images change layout; recalculate trigger positions once loaded.
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
