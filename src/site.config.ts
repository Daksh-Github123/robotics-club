/**
 * ─────────────────────────────────────────────────────────────
 *  SITE SETTINGS: edit this file first.
 *  Anything marked TODO is placeholder text waiting for real info.
 * ─────────────────────────────────────────────────────────────
 */
export const site = {
  /** Full club name, shown in the nav, footer and browser tab. */
  name: 'Tech for Change',
  /** 2–3 letters for the hexagon logo badge. */
  shortName: 'TFC',
  school: 'Inventure Academy',
  founded: 2025,

  description:
    'Tech for Change is the fully student-led robotics and tech club at Inventure Academy, where students choose their own project, learn what it needs, build it in school and present it at the BA Showcase.',

  /**
   * Homepage hero photo: the file name of an image in src/assets/ (e.g. 'hero.jpg').
   * It is resized and compressed automatically. A wide photo of members building
   * or presenting works best. Leave '' for a plain hero with no photo.
   */
  heroPhoto: 'hero.jpg',
  /** One line describing the hero photo, for screen readers. */
  heroPhotoAlt: 'Two members in school uniform, one soldering wires on a robot car while the other watches',

  meeting: {
    when: 'Twice a week, in two separate BA periods',
    /** Update each sprint. */
    where: 'Classroom 11A (Sprint 2 of the 2026–27 school year)',
  },

  /**
   * CURRENT SIGN-UP STATUS: update this each term.
   * open: true shows it in orange as good news; false shows it as a notice.
   * The message appears on the homepage, the Join page and the Why Join page.
   */
  signups: {
    open: false,
    message:
      "Sign-ups through the BA form are closed right now, but there's still space in the BA. Email the school's BA coordinator to ask to enrol.",
  },

  /** How students join. Sign-ups run through the school's Beyond Academics (BA) program. */
  applyInfo:
    "Sign up through the school's Beyond Academics (BA) program sign-ups. Spots are first come, first served, so sign up as soon as they open.",

  /** Weekly time commitment shown on the Join page. */
  timeCommitment: 'Two BA periods a week',

  /** Leave a value as '' to hide that link. */
  socials: {
    instagram: '', // e.g. 'https://instagram.com/yourclub'
    youtube: '',
    email: '', // e.g. 'robotics@yourschool.edu'
  },

  /** Source code link shown in the footer. */
  repoUrl: 'https://github.com/Daksh-Github123/robotics-club',

  features: {
    /** Flip to true once the club has sponsors/funding to show off. Adds "Sponsors" to the nav. */
    showSponsors: false,
  },
};
