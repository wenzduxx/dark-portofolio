import type { Block, Appearance } from '../lib/blocks';

export interface ProjectCaseStudy {
  id: string;
  title: string;
  category: string;
  year: string;
  client: string;
  role: string;
  heroImage: string;
  description: string;
  background: {
    title: string;
    content: string;
  };
  problem: {
    title: string;
    content: string;
  };
  solution: {
    title: string;
    content: string;
  };
  methodology?: {
    description: string;
    phases: { name: string; description: string }[];
  };
  technical: {
    stack: string[];
    details: string;
  };
  outcomes?: {
    description: string;
    metrics: { label: string; value: string }[];
  };
  liveUrl?: string;
  repoUrl?: string;
  visuals: {
    url: string;
    caption: string;
  }[];
  blocks?: Block[]; // Optional flexible "extended" content section
  appearance?: Appearance | null;
}

export const DETAILED_PROJECTS: Record<string, ProjectCaseStudy> = {
  'automotive-motion': {
    id: 'automotive-motion',
    title: 'Automotive Motion',
    category: 'Motion Design',
    year: '2024',
    client: 'Porsche Digital',
    role: 'Lead Visual Designer',
    heroImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=2000',
    description: 'A high-performance digital showcase for the next generation of electric sports cars, focusing on fluid animations and tactile feedback.',
    background: {
      title: 'The Digital Shift',
      content: 'As the automotive industry pivots towards electric mobility, the digital interface becomes the primary touchpoint for the brand experience. The goal was to translate raw mechanical power into digital elegance.'
    },
    problem: {
      title: 'Static Engagement',
      content: 'Traditional automotive configurators felt static and disconnected from the exhilaration of driving. Users needed a way to feel the speed and precision of the vehicle through their screen.'
    },
    solution: {
      title: 'Fluid Dynamics',
      content: 'We implemented a WebGL-based engine that simulates wind resistance and lighting in real-time. Every interaction, from color selection to performance toggling, triggers a physics-based response.'
    },
    methodology: {
      description: 'Our approach merged automotive engineering data with real-time UI rendering techniques, executed over a 12-week design sprint.',
      phases: [
        { name: 'Data Ingestion', description: 'Parsed CAD data and reduced polycount by 90% for web delivery without losing visual fidelity.' },
        { name: 'Physics Prototyping', description: 'Developed GLSL shaders to represent real-world aerodynamics and lighting reflections.' },
        { name: 'Haptic Sync', description: 'Synchronized Web Audio API layers to trigger nuanced sound design mimicking tactile feedback.' }
      ]
    },
    technical: {
      stack: ['React', 'Three.js', 'GSAP', 'GLSL Shaders', 'Web Audio API'],
      details: 'Leveraged custom vertex shaders to simulate aerodynamic flow over 3D models. The audio engine synchronizes haptic-like sounds with every frame-base transition.'
    },
    outcomes: {
      description: 'The platform redefined the benchmark for automotive configurators, matching the physical excitement of the brand.',
      metrics: [
        { label: 'Time on Site', value: '+140%' },
        { label: 'Conversion Rate', value: '+22%' },
        { label: 'Load Time', value: '< 1.2s' }
      ]
    },
    visuals: [
      { url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=1200', caption: 'Interface details and color configuration' },
      { url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200', caption: 'Shadow and lighting study for real-time rendering' },
      { url: 'https://images.unsplash.com/photo-1518985206232-22533ddc4a96?auto=format&fit=crop&q=80&w=1200', caption: 'Performance testing metrics' }
    ]
  },
  'urban-architecture': {
    id: 'urban-architecture',
    title: 'Urban Architecture',
    category: 'Concept Art',
    year: '2024',
    client: 'Metropolis Lab',
    role: 'Visual Architect',
    heroImage: '/src/assets/images/regenerated_image_1778765464383.webp',
    description: 'A visionary exploration of vertical living spaces, combining brutalist aesthetics with sustainable green architecture.',
    background: {
      title: 'Housing Density',
      content: 'Urban centers are facing unprecedented density challenges. This project explores how architecture can scale vertically without losing human connection to nature.'
    },
    problem: {
      title: 'Alienation in Concrete',
      content: 'Modern high-rises often feel like isolated cells. The challenge was to design a structure that facilitates community interaction and natural airflow at extreme heights.'
    },
    solution: {
      title: 'The Living Breath',
      content: 'Incorporated modular sky-gardens and shared social atriums every five floors. The design uses natural convection to cool the building, reducing energy consumption by 40%.'
    },
    technical: {
      stack: ['MidJourney', 'Blender', 'Unreal Engine 5', 'Rhino 3D'],
      details: 'Used parametric design tools to optimize structural integrity while maintaining complex organic forms. The lighting was simulated using Nanite and Lumen for cinematic fidelity.'
    },
    visuals: [
      { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200', caption: 'Structure detail and material study' },
      { url: 'https://images.unsplash.com/photo-1449156001935-d2863fb72690?auto=format&fit=crop&q=80&w=1200', caption: 'Interior social atrium concept' }
    ]
  },
  'human-perspective': {
    id: 'human-perspective',
    title: 'Human Perspective',
    category: 'Photography',
    year: '2023',
    client: 'Leica Collective',
    role: 'Art Director',
    heroImage: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&q=80&w=2000',
    description: 'A photographic journey capturing the uncurated moments of daily life across six metropolitan hubs.',
    background: {
      title: 'Digital Over-Edit',
      content: 'In the age of social media, photography has become heavily curated. This project sought to return to the "decisive moment" popularized by Henri Cartier-Bresson.'
    },
    problem: {
      title: 'The Loss of Truth',
      content: 'Photos are increasingly becoming digital assets rather than emotional records. We needed to capture images that felt raw and unfiltered.'
    },
    solution: {
      title: 'Film-First Workflow',
      content: 'Shot entirely on 35mm black and white film to force intentionality. Digital scans were left with original grain and imperfections to preserve the authenticity of the light.'
    },
    technical: {
      stack: ['Leica M6', 'Kodak Tri-X 400', 'Silverfast AI', 'Darkroom Printing'],
      details: 'Standardized development processes to ensure consistent contrast across diverse lighting conditions from Tokyo to London.'
    },
    visuals: [
      { url: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&q=80&w=1200', caption: 'Street scene in Shinjuku' },
      { url: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=1200', caption: 'Portrait study on 35mm' }
    ]
  },
  'brand-identity': {
    id: 'brand-identity',
    title: 'Brand Identity',
    category: 'Branding',
    year: '2023',
    client: 'Nexus AI',
    role: 'Identity Designer',
    heroImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=2000',
    description: 'A comprehensive branding system for an AI infrastructure company, balancing technical complexity with approachable design.',
    background: {
      title: 'The AI Boom',
      content: 'Nexus AI was launching into a crowded market. They needed a visual language that signaled both high-level engineering and human-centric values.'
    },
    problem: {
      title: 'Tech Coldness',
      content: 'AI brands often appear either overly futuristic and cold or childishly safe. The challenge was to find the "professional humanist" middle ground.'
    },
    solution: {
      title: 'Organic Geometry',
      content: 'Created a logo inspired by neural pathways but rendered with hand-drawn subtle imperfections. The color palette uses deep navy for stability and vibrant teal for neural energy.'
    },
    technical: {
      stack: ['Adobe Illustrator', 'Figma', 'Motion', 'Next.js'],
      details: 'Built a dynamic brand portal where guidelines are delivered as a live component library rather than a static PDF.'
    },
    visuals: [
      { url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&q=80&w=1200', caption: 'Logo construction and grid' },
      { url: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=1200', caption: 'Typography and brand applications' }
    ]
  }
};
