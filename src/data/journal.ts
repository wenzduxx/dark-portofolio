import type { Block, Appearance } from '../lib/blocks';

export interface JournalEntry {
  id: string;
  title: string;
  category: string;
  date: string;
  readingTime: string;
  heroImage: string;
  excerpt: string;
  content: string[]; // Legacy plain paragraphs (fallback when `blocks` is empty)
  tags: string[];
  blocks?: Block[]; // Flexible content blocks (primary when present)
  appearance?: Appearance | null;
}

export const JOURNAL_ENTRIES: Record<string, JournalEntry> = {
  'future-of-interface': {
    id: 'future-of-interface',
    title: 'The Future of Interface: Beyond the Glass',
    category: 'Design Theory',
    date: 'Dec 14, 2024',
    readingTime: '6 min read',
    heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000',
    excerpt: 'Exploring how zero-UI and ambient computing will redefine our relationship with digital tools.',
    content: [
      "The rectangle has defined our digital lives for three decades. From the bulky CRT monitors of the 90s to the ultra-thin glass in our pockets today, we have learned to interact with information through a window. But the window is starting to dissolve.",
      "Ambient computing represents a shift from \"using a computer\" to \"living in a computing environment.\" It is characterized by interfaces that vanish until needed, responding to voice, gesture, and presence rather than just taps and clicks.",
      "We are moving toward a world where the interface isn't something you look at, but something you experience. This requires designers to think more like architects and psychologists, focusing on flow, spatial awareness, and cognitive load rather than just pixel-perfect grids."
    ],
    tags: ['Interface', 'Future', 'Theory', 'UI/UX']
  },
  'brutalist-renaissance': {
    id: 'brutalist-renaissance',
    title: 'Brutalist Renaissance in Web Design',
    category: 'Development',
    date: 'Nov 28, 2024',
    readingTime: '4 min read',
    heroImage: 'https://images.unsplash.com/photo-1518005020470-3663be0b1484?auto=format&fit=crop&q=80&w=2000',
    excerpt: 'Why the web is returning to raw, honest aesthetics and what it means for usability.',
    content: [
      "Digital Brutalism is a reaction against the over-polished, sanitized web of the 2010s. It embraces rough edges, bold typography, and a lack of traditional hierarchy to create something that feels radically honest.",
      "It’s not just about \"ugly\" design; it’s about stripping away layers of artifice. By exposing the underlying structure of the hypermedia, brutalist sites offer a sense of structural integrity that many modern SPAs lack.",
      "In our work, we find that a hybrid approach—combining brutalist honesty with modern performance and animation—creates a tension that attracts the eye while maintaining professional usability."
    ],
    tags: ['Brutalism', 'Web Design', 'Aesthetics', 'Trend']
  }
};
