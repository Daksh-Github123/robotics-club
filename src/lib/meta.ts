import type { CollectionEntry } from 'astro:content';

type MilestoneType = CollectionEntry<'milestones'>['data']['type'];
type ProjectStatus = CollectionEntry<'projects'>['data']['status'];

/** How each milestone type looks on the timeline. */
export const milestoneMeta: Record<MilestoneType, { label: string; icon: string; color: string }> = {
  founding: { label: 'Founded', icon: 'flag', color: '--orange' },
  sprint: { label: 'Sprint', icon: 'bolt', color: '--blue' },
  showcase: { label: 'Showcase', icon: 'star', color: '--orange' },
  funding: { label: 'Funding', icon: 'coin', color: '--green' },
  competition: { label: 'Competition', icon: 'trophy', color: '--yellow' },
  deployment: { label: 'Deployed in school', icon: 'school', color: '--green' },
  other: { label: 'Milestone', icon: 'dot', color: '--blue' },
};

export const statusLabel: Record<ProjectStatus, string> = {
  concept: 'Concept',
  building: 'In progress',
  complete: 'Complete',
  deployed: 'Deployed in school',
};

/** "2025-26" → "2025–26" (with a proper en dash). */
export const yearLabel = (academicYear: string) => academicYear.replace('-', '–');

/** Team as readable names: "Reyansh Sen (coding)" → "Reyansh Sen"; joined with commas and "and". */
export function teamNames(team: string[]) {
  const names = team.map((n) => n.replace(/\s*\(.*\)$/, ''));
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

/** Icon for each kind of media link on a project. */
export const mediaIcon: Record<string, string> = {
  photos: 'image',
  video: 'play',
  folder: 'folder',
  doc: 'file',
  other: 'external',
};

export const sortMilestones =(items: CollectionEntry<'milestones'>[]) =>
  [...items].sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());

/** Featured first, then newest first. */
export const sortProjects = (items: CollectionEntry<'projects'>[]) =>
  [...items].sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || b.data.date.valueOf() - a.data.date.valueOf(),
  );

export const sortMembers = (items: CollectionEntry<'members'>[]) =>
  [...items].sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));

export function formatDate(d: Date, style: 'month' | 'full' = 'month') {
  return d.toLocaleDateString('en-US', {
    month: style === 'full' ? 'long' : 'short',
    day: style === 'full' ? 'numeric' : undefined,
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
