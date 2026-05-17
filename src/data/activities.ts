export interface Activity {
  id: string;
  title: string;
  type: 'Insight' | 'Event' | 'Experiment';
  status: string;
  date: string;
  description: string;
  longDescription: string;
  impact?: string;
  links?: { label: string; url: string }[];
}

export const ACTIVITIES: Record<string, Activity> = {
  'generative-patterns': {
    id: 'generative-patterns',
    title: 'Generative Design Patterns',
    type: 'Experiment',
    status: 'In Progress',
    date: 'Spring 2024',
    description: 'Exploring algorithmic textures in Three.js.',
    longDescription: 'This activity is a deep dive into using noise functions and mathematical series to generate infinite, non-repeating UI textures. The goal is to move away from static images and toward living, breathing backgrounds that respond to user behavior and environment.',
    impact: 'Reduced asset bundle size by 40% in experimental builds and increased user session time by 15% through mesmerized engagement.',
    links: [{ label: 'View Sandbox', url: '#' }]
  },
  'hci-talk-2023': {
    id: 'hci-talk-2023',
    title: 'HCI Conference Talk',
    type: 'Event',
    status: 'Completed',
    date: 'Oct 2023',
    description: 'Shared my thesis on emotional interfaces.',
    longDescription: 'Presented a 45-minute keynote on "The Emotional Interface" at the International HCI Summit. The talk focused on how micro-interactions can be used to build trust and evoke specific emotional responses in high-stakes software environments.',
    impact: 'Voted Top 5 Innovative Talks; influenced the design direction of two major fintech startups.',
    links: [{ label: 'Watch Recording', url: '#' }]
  }
};
