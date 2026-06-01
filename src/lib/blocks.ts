// Flexible content-block model shared by the public site and the backoffice editor.
// Stored as a JSONB array on `posts.content_blocks` and `projects.content_blocks`.

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'callout'
  | 'list'
  | 'divider'
  | 'image'
  | 'gallery'
  | 'video'
  | 'embed'
  | 'code'
  | 'techStack'
  | 'buttons'
  | 'stats'
  | 'columns'
  | 'table';

export type Align = 'left' | 'center';

export interface BlockBase {
  id: string;
  type: BlockType;
}

// --- Rich text ---
export interface HeadingBlock extends BlockBase {
  type: 'heading';
  level: 2 | 3 | 4;
  text: string;
  align?: Align;
}
export interface ParagraphBlock extends BlockBase {
  type: 'paragraph';
  text: string; // markdown
  dropcap?: boolean;
  align?: Align;
}
export interface QuoteBlock extends BlockBase {
  type: 'quote';
  text: string;
  attribution?: string;
}
export type CalloutVariant = 'info' | 'impact' | 'warning';
export interface CalloutBlock extends BlockBase {
  type: 'callout';
  variant: CalloutVariant;
  title?: string;
  text: string; // markdown
}
export interface ListBlock extends BlockBase {
  type: 'list';
  ordered: boolean;
  items: string[];
}
export interface DividerBlock extends BlockBase {
  type: 'divider';
}

// --- Media ---
export type ImageWidth = 'normal' | 'wide' | 'full';
export interface ImageBlock extends BlockBase {
  type: 'image';
  url: string;
  caption?: string;
  width: ImageWidth;
  rounded?: boolean;
}
export interface GalleryImage {
  url: string;
  caption?: string;
}
export type GalleryLayout = 'grid' | 'carousel' | 'masonry';
export interface GalleryBlock extends BlockBase {
  type: 'gallery';
  layout: GalleryLayout;
  images: GalleryImage[];
}
export type VideoProvider = 'youtube' | 'vimeo' | 'file';
export interface VideoBlock extends BlockBase {
  type: 'video';
  provider: VideoProvider;
  url: string;
  caption?: string;
}
export interface EmbedBlock extends BlockBase {
  type: 'embed';
  url: string;
  height?: number;
}

// --- Technical ---
export interface CodeBlock extends BlockBase {
  type: 'code';
  language: string;
  code: string;
  filename?: string;
}
export interface TechStackBlock extends BlockBase {
  type: 'techStack';
  items: string[];
}
export type ButtonIcon = 'live' | 'github' | 'download' | 'link';
export type ButtonVariant = 'primary' | 'ghost';
export interface ButtonItem {
  label: string;
  url: string;
  variant: ButtonVariant;
  icon?: ButtonIcon;
}
export interface ButtonsBlock extends BlockBase {
  type: 'buttons';
  items: ButtonItem[];
}

// --- Data & layout ---
export interface StatItem {
  label: string;
  value: string;
}
export interface StatsBlock extends BlockBase {
  type: 'stats';
  items: StatItem[];
}
export interface ColumnsBlock extends BlockBase {
  type: 'columns';
  left: Block[];
  right: Block[];
}
export interface TableBlock extends BlockBase {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | QuoteBlock
  | CalloutBlock
  | ListBlock
  | DividerBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | EmbedBlock
  | CodeBlock
  | TechStackBlock
  | ButtonsBlock
  | StatsBlock
  | ColumnsBlock
  | TableBlock;

// --- Per-page appearance ---
export type HeaderStyle = 'centered' | 'left' | 'full-hero';
export type ContentWidth = 'narrow' | 'wide';
export interface Appearance {
  accentColor?: string; // hex e.g. "#84CC16"; empty/undefined = use default white accent
  headerStyle?: HeaderStyle;
  contentWidth?: ContentWidth;
  showDecor?: boolean;
}

export const DEFAULT_APPEARANCE: Required<Appearance> = {
  accentColor: '',
  headerStyle: 'centered',
  contentWidth: 'narrow',
  showDecor: true,
};

/** Merge a stored (possibly null) appearance over the defaults. */
export function resolveAppearance(a?: Appearance | null): Required<Appearance> {
  return { ...DEFAULT_APPEARANCE, ...(a || {}) };
}

/** Normalise an unknown JSON value into a clean Block[] (drops malformed entries). */
export function normalizeBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (b): b is Block => !!b && typeof b === 'object' && typeof (b as any).type === 'string'
  );
}

/**
 * Convert a hex colour to "H S% L%" channel string for the `--accent` CSS variable.
 * The design tokens are stored as HSL channels (`--accent: 0 0% 96%`) and consumed via
 * `hsl(var(--accent))`, so overriding `--accent` on a wrapper recolours every
 * `text-accent` / `bg-accent` / `border-accent` utility beneath it.
 */
export function hexToHslChannels(hex: string): string | null {
  const m = (hex || '').trim().replace('#', '');
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(m)) return null;
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
