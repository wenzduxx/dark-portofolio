import type { ComponentType } from 'react';
import type { Block, BlockType } from '../../../lib/blocks';
import {
  Heading2,
  Pilcrow,
  Quote,
  Megaphone,
  List,
  Minus,
  Image as ImageIcon,
  Images,
  Video,
  Code2,
  Cpu,
  MousePointerClick,
  BarChart3,
  Columns2,
  Table,
  Globe,
} from 'lucide-react';

export function freshId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `b-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Build a blank block of the given type with sensible defaults. */
export function newBlock(type: BlockType): Block {
  const id = freshId();
  switch (type) {
    case 'heading':
      return { id, type, level: 2, text: '', align: 'left' };
    case 'paragraph':
      return { id, type, text: '', dropcap: false, align: 'left' };
    case 'quote':
      return { id, type, text: '', attribution: '' };
    case 'callout':
      return { id, type, variant: 'info', title: '', text: '' };
    case 'list':
      return { id, type, ordered: false, items: [''] };
    case 'divider':
      return { id, type };
    case 'image':
      return { id, type, url: '', caption: '', width: 'wide', rounded: true };
    case 'gallery':
      return { id, type, layout: 'grid', images: [] };
    case 'video':
      return { id, type, provider: 'youtube', url: '', caption: '' };
    case 'embed':
      return { id, type, url: '', height: 480 };
    case 'code':
      return { id, type, language: 'tsx', code: '', filename: '' };
    case 'techStack':
      return { id, type, items: [''] };
    case 'buttons':
      return { id, type, items: [{ label: '', url: '', variant: 'primary', icon: 'link' }] };
    case 'stats':
      return { id, type, items: [{ label: '', value: '' }] };
    case 'columns':
      return { id, type, left: [], right: [] };
    case 'table':
      return { id, type, headers: ['', ''], rows: [['', '']] };
    default:
      return { id, type: 'paragraph', text: '' } as Block;
  }
}

/** Deep-clone a block (and its nested column children) with fresh ids. */
export function cloneBlock(block: Block): Block {
  const copy: any = JSON.parse(JSON.stringify(block));
  copy.id = freshId();
  if (copy.type === 'columns') {
    copy.left = (copy.left || []).map((b: Block) => cloneBlock(b));
    copy.right = (copy.right || []).map((b: Block) => cloneBlock(b));
  }
  return copy as Block;
}

export interface BlockTypeMeta {
  type: BlockType;
  label: string;
  icon: ComponentType<{ className?: string }>;
  category: 'Text' | 'Media' | 'Technical' | 'Data & layout';
}

// Order defines how the "Add block" menu is grouped/listed.
export const BLOCK_TYPES: BlockTypeMeta[] = [
  { type: 'heading', label: 'Heading', icon: Heading2, category: 'Text' },
  { type: 'paragraph', label: 'Paragraph', icon: Pilcrow, category: 'Text' },
  { type: 'quote', label: 'Quote', icon: Quote, category: 'Text' },
  { type: 'callout', label: 'Callout', icon: Megaphone, category: 'Text' },
  { type: 'list', label: 'List', icon: List, category: 'Text' },
  { type: 'divider', label: 'Divider', icon: Minus, category: 'Text' },
  { type: 'image', label: 'Image', icon: ImageIcon, category: 'Media' },
  { type: 'gallery', label: 'Gallery', icon: Images, category: 'Media' },
  { type: 'video', label: 'Video', icon: Video, category: 'Media' },
  { type: 'embed', label: 'Embed', icon: Globe, category: 'Media' },
  { type: 'code', label: 'Code', icon: Code2, category: 'Technical' },
  { type: 'techStack', label: 'Tech badges', icon: Cpu, category: 'Technical' },
  { type: 'buttons', label: 'Buttons / links', icon: MousePointerClick, category: 'Technical' },
  { type: 'stats', label: 'Stats', icon: BarChart3, category: 'Data & layout' },
  { type: 'columns', label: '2 columns', icon: Columns2, category: 'Data & layout' },
  { type: 'table', label: 'Table', icon: Table, category: 'Data & layout' },
];

export const BLOCK_CATEGORIES: BlockTypeMeta['category'][] = ['Text', 'Media', 'Technical', 'Data & layout'];
