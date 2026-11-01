import type { ComponentType, LazyExoticComponent } from 'react';

export type Subject = 'reading' | 'math' | 'science' | 'geography' | 'art' | 'games';

export interface Skill {
  id: string;
  subject: Subject;
  name: string;
  strand: string;
  /** Plain-English tip for parents shown in reports. */
  tip: string;
  /** false = tracked and reported, but not a rung on the placement/level ladder (e.g. comprehension). */
  ladder?: boolean;
}

export interface Attempt {
  skillIds: string[];
  appId: string;
  correct: boolean;
  given?: string;
  expected?: string;
  hintsUsed: number;
  ms: number;
  at: number;
  errorTags?: string[];
}

export type SkillStatus = 'new' | 'practicing' | 'getting' | 'mastered';

export interface RecentAttempt { c: 0 | 1; h: number; t: number }

export interface SkillState {
  skillId: string;
  mastery: number; // 0-100
  attempts: number;
  correct: number;
  lastSeen: number;
  days: string[];
  status: SkillStatus;
  reviewStep: number;
  nextReview?: number;
  placed?: boolean;
  /** Last 12 attempts, newest last. Mastery is computed from this. */
  recent?: RecentAttempt[];
  /** errorTag -> count + latest example ("ship→sip"). */
  errors?: Record<string, { n: number; ex: string }>;
}

export type HintMode = 'full' | 'limited' | 'nudge-only';

export interface ProfileSettings {
  dailyMinutes: number; // 0 = unlimited
  hintMode: HintMode;
  speechRate: number;
  allowedThemes: string[]; // empty = all
  disabledApps: string[];
  /** Lock-out window, 24h "HH:MM". May cross midnight. */
  bedtime?: { from: string; to: string } | null;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  themeId: string;
  levels: Partial<Record<Subject, number>>;
  /** Parent cap: highest ladder index the engine may serve, per subject. */
  lockLevels?: Partial<Record<Subject, number>>;
  focusSkills: string[];
  placementDone: boolean;
  stars: number;
  stickers: string[];
  missionsDone?: number;
  settings: ProfileSettings;
  createdAt: number;
  updatedAt?: number;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  helper: { name: string; emoji: string };
  colors: { bg1: string; bg2: string; primary: string; accent: string; card: string; text: string };
  collectible: { emoji: string; one: string; many: string };
  container: { emoji: string; name: string };
  thief: { emoji: string; name: string };
  pieces: [string, string];
  mapTitle: string; // use {name}
  islands: Record<Subject, string>;
  islandEmoji: Record<Subject, string>;
  mystery: { name: string; emoji: string };
  brain: { name: string; emoji: string };
  missionNames: string[];
  stickers: string[];
  praise: string[];
  decor: string[];
}

export interface RoundResult { correct: number; total: number }

export interface MiniAppProps {
  profile: Profile;
  theme: Theme;
  onExit: () => void;
  /** Questions per round (default 5). Missions use 3. */
  rounds?: number;
  /** Called when a round finishes. When present the app hands control back instead of showing its own end screen. */
  onComplete?: (r: RoundResult) => void;
}

export interface MiniApp {
  id: string;
  title: string;
  subject: Subject;
  icon: string;
  blurb: string;
  /** Skill ids this app can serve. Games with no skills use []. */
  skills: string[];
  /** Shown on the Mystery island instead of its subject island. */
  place?: 'mystery' | 'brain';
  component: LazyExoticComponent<ComponentType<MiniAppProps>>;
}

export interface Hint {
  text: string;
  say?: string;
  /** Built-in effects understood by QuestionCard. */
  effect?: 'eliminate' | 'reveal' | 'soundOut' | 'count' | 'repeat';
}

/* ---------- Questions (shared by every skill-based mini-app) ---------- */

export interface Choice {
  id: string;
  text?: string;
  emoji?: string;
  /** Error tags recorded if the child picks this (wrong) choice. */
  tags?: string[];
  /** Draws a coloured shape instead of an emoji (Captain's Log). */
  shape?: { kind: 'circle' | 'square' | 'triangle' | 'star'; color: string; big: boolean };
}

export type QuestionKind = 'word' | 'sight' | 'count' | 'compare' | 'add' | 'sub' | 'make10' | 'story' | 'rhyme' | 'follow' | 'group';

export interface Question {
  id: string;
  skill: string;
  kind: QuestionKind;
  prompt: string;
  say?: string;
  /** Don't read the prompt aloud automatically (reading-comprehension questions). */
  silent?: boolean;
  word?: string;
  emoji?: string;
  tiles?: string[];
  sounds?: string[];
  a?: number;
  b?: number;
  n?: number;
  /** 0 = coins, 1 = number line, 2 = bare numbers. */
  support?: 0 | 1 | 2;
  choices: Choice[];
  answer: string;
  /** [nudge, narrow, show]. */
  hints: Hint[];
  explain: Hint;
}
