export interface AcademicEntry {
  id: string;
  degree: string;
  school: string;
  period: string;
  location: string;
  shortDesc: string;
  longDesc: string;
  heroImage: string;
  activities: string[];
  metrics?: { label: string; value: string }[];
  gallery?: { url: string; caption: string }[];
}

export const ACADEMICS: Record<string, AcademicEntry> = {
  'master-hci-cmu': {
    id: 'master-hci-cmu',
    degree: "Master of Human-Computer Interaction",
    school: "Carnegie Mellon University",
    period: "2018 — 2019",
    location: "Pittsburgh, PA",
    shortDesc: "Explored the intersection of cognitive psychology, computer science, and design to build more human-centric software.",
    longDesc: "At Carnegie Mellon University, my coursework combined deep programming concepts with the psychological underpinnings of why people interact with technology the way they do. I was involved in several research projects exploring future interfaces, ubiquitous computing, and advanced interaction design techniques. My capstone project involved designing a predictive tool for medical professionals.",
    heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000",
    activities: [
      "Research Assistant at the Human-Computer Interaction Institute",
      "Lead Designer for Capstone Project - Predictive Health Dashboard",
      "Member of the Design for Social Impact Coalition",
      "Published paper on Micro-interactions in ubiquitous environments"
    ],
    metrics: [
      { label: "GPA", value: "3.9/4.0" },
      { label: "Research Papers", value: "2" }
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200", caption: "Group collaboration on the health dashboard capstone project." },
      { url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1200", caption: "Prototyping tangible user interfaces in the lab." }
    ]
  },
  'bfa-risd': {
    id: 'bfa-risd',
    degree: "BFA in Graphic Design",
    school: "Rhode Island School of Design",
    period: "2014 — 2018",
    location: "Providence, RI",
    shortDesc: "Developed a strong foundation in visual communication, typography, and systemic design thinking.",
    longDesc: "Rhode Island School of Design (RISD) is where I honed my visual craft. I immersed myself in traditional typography, printmaking, and branding, eventually discovering a passion for digital mediums and creative coding. The rigorous studio environment taught me how to critique, iterate rapidly, and justify design decisions intuitively.",
    heroImage: "https://images.unsplash.com/photo-1558231018-9ce5b8042459?auto=format&fit=crop&q=80&w=2000",
    activities: [
      "Creative Director of the student-run design agency",
      "Thesis: The intersection of generative systems and traditional typography",
      "Teacher's Assistant for core visual design courses",
      "Exhibited interactive installations at the RISD Museum"
    ],
    metrics: [
      { label: "Awards", value: "Trustees Scholar" },
      { label: "Exhibitions", value: "3" }
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1598064601140-7ecb8fcee8e4?auto=format&fit=crop&q=80&w=1200", caption: "Thesis exhibition featuring generative posters." },
      { url: "https://images.unsplash.com/photo-1542125586-8a7bd885c35e?auto=format&fit=crop&q=80&w=1200", caption: "Late-night studio sessions working on branding systems." }
    ]
  }
};
