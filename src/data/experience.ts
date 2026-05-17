export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  shortDesc: string;
  longDesc: string;
  heroImage: string;
  responsibilities: string[];
  technologies: string[];
  metrics?: { label: string; value: string }[];
  gallery?: { url: string; caption: string }[];
}

export const EXPRIENCES: Record<string, ExperienceEntry> = {
  'linear-senior-product-designer': {
    id: 'linear-senior-product-designer',
    role: "Senior Product Designer",
    company: "Linear",
    period: "2023 — Present",
    location: "San Francisco, CA (Remote)",
    shortDesc: "Leading design systems and core product features for the next generation of project management tools.",
    longDesc: "At Linear, I spearheaded the evolution of the core product design system. Recognizing the need for a cohesive and scalable design language, I initiated a comprehensive audit of existing UI components. This led to the development of a unified component library that not only improved consistency across the platform but also significantly reduced design-to-development handoff time.",
    heroImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000",
    responsibilities: [
      "Led the design of advanced filtering and planning views.",
      "Redesigned the onboarding experience, increasing activation rate.",
      "Mentored junior designers and established design critique processes.",
      "Collaborated closely with engineering to ensure seamless implementation of motion and interactions."
    ],
    technologies: ["Figma", "React", "Framer Motion", "Storybook", "TypeScript"],
    metrics: [
      { label: "Component Adoption", value: "95%" },
      { label: "Activation Rate", value: "+18%" },
      { label: "Design Handoff Speed", value: "2x" }
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1542744094-24638ea0b347?auto=format&fit=crop&q=80&w=1200", caption: "Design system documentation and atomic components." },
      { url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200", caption: "Collaborative whiteboarding session for planning views." }
    ]
  },
  'stripe-visual-interface-designer': {
    id: 'stripe-visual-interface-designer',
    role: "Visual Interface Designer",
    company: "Stripe",
    period: "2021 — 2023",
    location: "Seattle, WA",
    shortDesc: "Refined checkout experiences and developer tools, focusing on cross-platform consistency and accessibility.",
    longDesc: "During my time at Stripe, I was deeply involved in optimizing the checkout flow for millions of users. The challenge was to balance a frictionless user experience with the stringent security requirements of online payments. By streamlining the UI and introducing clear microcopy, we were able to increase conversion rates across various merchants.",
    heroImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=2000",
    responsibilities: [
      "Designed and prototyped responsive checkout interfaces.",
      "Conducted extensive user research to identify pain points in the payment process.",
      "Developed an accessible color palette and typographic hierarchy.",
      "Worked with marketing to create engaging promotional materials."
    ],
    technologies: ["Figma", "Protopie", "CSS/SASS", "HTML", "React"],
    metrics: [
      { label: "Conversion Lift", value: "+4.5%" },
      { label: "Accessibility Score", value: "100/100" }
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200", caption: "Checkout flow iterations focusing on reduced friction." },
      { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200", caption: "Analytics dashboard for merchant performance." }
    ]
  },
  'active-theory-interactive-developer': {
    id: 'active-theory-interactive-developer',
    role: "Interactive Developer",
    company: "Active Theory",
    period: "2019 — 2021",
    location: "Los Angeles, CA",
    shortDesc: "Built immersive WebGL experiences and high-performance interactive websites for global luxury brands.",
    longDesc: "At Active Theory, I pushed the boundaries of web technologies to create award-winning digital experiences. I specialized in integrating 3D graphics with web technologies, resulting in highly engaging and performant websites. A key project involved developing a WebGL-based product customizer for an automotive client.",
    heroImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000",
    responsibilities: [
      "Developed custom WebGL shaders and 3D scenes.",
      "Implemented complex animations using GSAP and custom physics engines.",
      "Optimized assets and code for maximum performance across devices.",
      "Collaborated with 3D artists to translate models into interactive web assets."
    ],
    technologies: ["Three.js", "WebGL", "GLSL", "GSAP", "JavaScript"],
    metrics: [
      { label: "Awwwards", value: "3x SOTD" },
      { label: "Performance", value: "60 FPS" }
    ]
  }
};
