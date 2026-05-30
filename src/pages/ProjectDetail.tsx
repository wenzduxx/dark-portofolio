import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowUpRight, ArrowRight, Github, Globe, CheckCircle2, Maximize2, Mail } from 'lucide-react';
import { usePortfolioData } from '../contexts/PortfolioDataContext';
import CountUp from '../components/CountUp';
import Lightbox from '../components/Lightbox';

gsap.registerPlugin(ScrollTrigger);

/**
 * Split a metric value like "+140%", "< 1.2s" or "1,200" into an animatable
 * number plus its prefix/suffix so it can be rendered with <CountUp>. Returns
 * null for non-numeric values (those are shown verbatim).
 */
function parseMetric(value: string): { prefix: string; num: number; suffix: string } | null {
  const match = value.match(/^(\D*)(\d[\d,.]*)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  const num = parseFloat(numStr.replace(/,/g, ''));
  if (Number.isNaN(num)) return null;
  return { prefix, num, suffix };
}

/** Tailwind grid span + aspect ratio for an adaptive gallery item. */
function galleryItemClass(index: number, total: number): string {
  if (total === 1) return 'md:col-span-12 aspect-[16/9]';
  if (total === 2) return 'md:col-span-6 aspect-[4/3]';
  if (total === 3) return index === 0 ? 'md:col-span-12 aspect-[16/9]' : 'md:col-span-6 aspect-[4/3]';
  return 'md:col-span-6 aspect-[4/3]';
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { detailedProjects: DETAILED_PROJECTS, loading, contact } = usePortfolioData();
  const project = id ? DETAILED_PROJECTS[id] : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const heroScaleRaw = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOpacityRaw = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroStyle = reduceMotion ? undefined : { scale: heroScaleRaw, opacity: heroOpacityRaw };

  // Lightbox state — index into project.visuals, or null when closed.
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLightboxIndex(null);
    if (!loading && !project) {
      navigate('/work');
      return;
    }

    // Wait for the loaded content to actually render before wiring up
    // animations — during the loading render only the spinner is mounted, so
    // containerRef is null and the selectors below match nothing. The effect
    // re-runs once `loading` flips to false (it's in the dependency array).
    if (loading || !project) return;

    // Only run scroll-driven motion when the user hasn't asked to reduce it.
    // Targets stay at their natural (visible) state otherwise.
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Intro Text Reveal
      gsap.from('.reveal-text', {
        y: 60,
        opacity: 0,
        rotateX: 10,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power4.out',
      });

      // Parallax Images
      gsap.utils.toArray<HTMLElement>('.parallax-img').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: img.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // Fade up sections
      gsap.utils.toArray<HTMLElement>('.fade-up-section').forEach((section) => {
        gsap.from(section, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%' },
        });
      });

      // Staggered list items
      if (gsap.utils.toArray('.stagger-item').length) {
        gsap.from('.stagger-item', {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.stagger-list', start: 'top 75%' },
        });
      }
    }, containerRef);

    return () => mm.revert();
  }, [project, navigate, loading]);

  if (loading)
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!project) return null;

  const hasLinks = Boolean(project.liveUrl || project.repoUrl);

  // Mid-page feature image (first visual) + the remaining gallery images.
  const featureVisual = project.visuals[0] ?? null;
  const galleryVisuals = project.visuals.slice(1);

  // Next project navigation (cycles through the available project slugs).
  const slugs = Object.keys(DETAILED_PROJECTS);
  const currentIdx = id ? slugs.indexOf(id) : -1;
  const nextSlug = slugs.length > 1 && currentIdx >= 0 ? slugs[(currentIdx + 1) % slugs.length] : null;
  const nextProject = nextSlug ? DETAILED_PROJECTS[nextSlug] : null;

  const facts = [
    { label: 'Category', value: project.category },
    { label: 'Year', value: project.year },
    { label: 'Client', value: project.client },
    { label: 'Role', value: project.role },
  ];

  return (
    <div ref={containerRef} className="bg-bg min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-end">
        <motion.div style={heroStyle} className="absolute inset-0 z-0">
          <img
            src={project.heroImage}
            alt={project.title}
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        </motion.div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12 pb-20">
          <Link
            to="/work"
            className="inline-flex items-center gap-2 text-muted hover:text-text-primary transition-colors mb-12 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Archive
          </Link>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted font-mono uppercase tracking-[0.3em]">{project.category}</span>
            </motion.div>
            <h1 className="reveal-text text-5xl md:text-8xl lg:text-9xl font-display italic leading-[0.85] tracking-tight text-text-primary mb-8">
              {project.title.split(' ')[0]} <br />
              <span className="text-text-primary/40 ml-[0.5em]">{project.title.split(' ').slice(1).join(' ')}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Structured Content Area */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Abstract / Executive Summary */}
        <section className="py-24 md:py-32 border-b border-stroke fade-up-section">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Executive Summary</h2>
              </div>
              <p className="text-2xl md:text-4xl text-text-primary/90 leading-tight md:leading-snug font-light italic">
                "{project.description}"
              </p>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 gap-8 h-fit pt-8 lg:pt-14 border-t lg:border-t-0 lg:border-l border-stroke lg:pl-12">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest mb-2">Year</h3>
                <div className="text-sm text-text-primary font-mono">{project.year}</div>
              </div>
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest mb-2">Client</h3>
                <div className="text-sm text-text-primary font-mono">{project.client}</div>
              </div>
              <div className="col-span-2">
                <h3 className="text-[10px] text-muted uppercase tracking-widest mb-2">Role</h3>
                <div className="text-sm text-text-primary font-mono">{project.role}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Discovery & Problem Context */}
        <section className="py-24 md:py-32 fade-up-section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">01</span>
                <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Background</h2>
              </div>
              <h3 className="text-3xl md:text-5xl text-text-primary mb-8 font-display italic leading-tight">{project.background.title}</h3>
              <p className="text-muted leading-relaxed text-lg md:text-xl font-light">{project.background.content}</p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">02</span>
                <h2 className="text-xs text-muted uppercase tracking-[0.3em]">The Challenge</h2>
              </div>
              <h3 className="text-3xl md:text-5xl text-text-primary mb-8 font-display italic leading-tight">{project.problem.title}</h3>
              <p className="text-muted leading-relaxed text-lg md:text-xl font-light">{project.problem.content}</p>
            </div>
          </div>
        </section>

        {/* Full Bleed Feature Visual */}
        {featureVisual && (
          <section className="pb-32 fade-up-section">
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              aria-label={`View image: ${featureVisual.caption}`}
              className="group block w-full aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-surface relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{ clipPath: 'inset(0)' }}
            >
              <img
                src={featureVisual.url}
                alt={featureVisual.caption}
                loading="lazy"
                decoding="async"
                className="w-full h-[140%] absolute left-0 top-[-20%] object-cover parallax-img"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-bg/50 backdrop-blur-md flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 bg-bg/50 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/70 font-mono flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                {featureVisual.caption}
              </div>
            </button>
          </section>
        )}

        {/* Methodology (If exists) */}
        {project.methodology && (
          <section className="py-24 border-t border-stroke fade-up-section">
            <div className="flex items-center gap-3 mb-16">
              <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">03</span>
              <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Methodology</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-5">
                <p className="text-2xl text-text-primary/90 font-light leading-relaxed">{project.methodology.description}</p>
              </div>
              <div className="lg:col-span-6 lg:col-start-7 stagger-list">
                <div className="space-y-12">
                  {project.methodology.phases.map((phase, idx) => (
                    <div key={idx} className="relative pl-8 stagger-item">
                      <span className="absolute left-0 top-1 text-xs text-accent font-mono">0{idx + 1}</span>
                      <h4 className="text-xl text-text-primary mb-3 font-medium">{phase.name}</h4>
                      <p className="text-muted leading-relaxed">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Solution — narrative (left) + sticky project panel (right) */}
        <section className="py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
            {/* Narrative */}
            <div className="lg:col-span-7 space-y-20">
              <div className="fade-up-section">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">04</span>
                  <h2 className="text-xs text-muted uppercase tracking-[0.3em]">The Solution</h2>
                </div>
                <h3 className="text-4xl md:text-5xl lg:text-6xl text-text-primary mb-8 font-display italic leading-[1.1]">{project.solution.title}</h3>
                <p className="text-muted leading-relaxed text-xl font-light">{project.solution.content}</p>
              </div>

              <div className="fade-up-section">
                <div className="flex items-center gap-3 mb-6">
                  <h4 className="text-xs text-muted uppercase tracking-[0.3em]">Technical Approach</h4>
                </div>
                <p className="text-muted leading-relaxed text-lg font-light">{project.technical.details}</p>
              </div>

              {/* Outcomes (If exists) */}
              {project.outcomes && (
                <div className="fade-up-section border-t border-stroke pt-16">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">05</span>
                    <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Impact & Outcomes</h2>
                  </div>
                  <p className="text-xl text-text-primary/90 font-light leading-relaxed mb-12">{project.outcomes.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {project.outcomes.metrics.map((metric, idx) => {
                      const parsed = parseMetric(metric.value);
                      return (
                        <div
                          key={idx}
                          className="p-6 bg-surface/50 border border-stroke rounded-2xl flex flex-col justify-center items-center text-center group hover:bg-surface transition-colors cursor-default"
                        >
                          <div className="text-3xl lg:text-4xl font-display italic text-text-primary mb-2 group-hover:scale-110 transition-transform tabular-nums">
                            {parsed && !reduceMotion ? (
                              <>
                                {parsed.prefix}
                                <CountUp to={parsed.num} duration={2} separator={parsed.num >= 1000 ? ',' : ''} />
                                {parsed.suffix}
                              </>
                            ) : (
                              metric.value
                            )}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest text-muted">{metric.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky project info panel */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <div className="p-8 bg-surface rounded-[2rem] border border-stroke fade-up-section">
                  <h2 className="text-xs text-muted uppercase tracking-[0.3em] mb-8">Project Info</h2>

                  <dl className="grid grid-cols-2 gap-x-6 gap-y-6 mb-8">
                    {facts.map((fact) => (
                      <div key={fact.label}>
                        <dt className="text-[10px] text-muted uppercase tracking-widest mb-2">{fact.label}</dt>
                        <dd className="text-sm text-text-primary font-mono break-words">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="border-t border-stroke pt-8">
                    <h3 className="text-[10px] text-muted uppercase tracking-widest mb-4">Architecture & Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technical.stack.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-bg border border-stroke/50 rounded-full text-xs text-text-primary font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {hasLinks && (
                    <div className="border-t border-stroke pt-8 mt-8 flex flex-col gap-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 text-sm text-text-primary hover:text-accent transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                        >
                          <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Live Preview</span>
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 text-sm text-text-primary hover:text-accent transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                        >
                          <span className="flex items-center gap-2"><Github className="w-4 h-4" /> Repository</span>
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Gallery (adaptive to the number of visuals) */}
        {galleryVisuals.length > 0 && (
          <section className="pb-32 fade-up-section">
            <div className="flex items-center gap-3 mb-12">
              <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">06</span>
              <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Gallery</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
              {galleryVisuals.map((visual, gi) => (
                <button
                  type="button"
                  key={gi}
                  onClick={() => setLightboxIndex(gi + 1)}
                  aria-label={`View image: ${visual.caption}`}
                  className={`group block w-full ${galleryItemClass(gi, galleryVisuals.length)}`}
                >
                  <div className="w-full h-full rounded-[1.75rem] overflow-hidden bg-surface border border-stroke relative cursor-pointer transition-colors group-hover:border-accent/40 group-focus-visible:ring-2 group-focus-visible:ring-accent" style={{ clipPath: 'inset(0)' }}>
                    <img
                      src={visual.url}
                      alt={visual.caption}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-[140%] absolute left-0 top-[-20%] object-cover parallax-img"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bg/50 backdrop-blur-md flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-muted font-mono flex items-center gap-2 px-1 text-left">
                    <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                    {visual.caption}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Visit Project / Contact CTA */}
        <section className="pb-24 fade-up-section">
          <div className="w-full rounded-[2rem] md:rounded-[3rem] bg-surface border border-stroke p-12 md:p-24 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative z-10 max-w-2xl mx-auto">
              {hasLinks ? (
                <>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-display italic text-text-primary mb-10">
                    See the system <br />in action.
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-text-primary text-bg px-8 py-4 rounded-full hover:scale-105 transition-transform text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        Live Preview <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 border border-stroke text-text-primary px-8 py-4 rounded-full hover:bg-white/5 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        Repository <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-display italic text-text-primary mb-6">
                    Like what you see?
                  </h2>
                  <p className="text-muted text-lg font-light mb-10">Let's build something exceptional together.</p>
                  <div className="flex items-center justify-center">
                    <a
                      href={contact?.email ? `mailto:${contact.email}` : '/#contact'}
                      className="flex items-center gap-3 bg-text-primary text-bg px-8 py-4 rounded-full hover:scale-105 transition-transform text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Start a project <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Next Project */}
        {nextProject && (
          <section className="pb-32">
            <Link
              to={`/project/${nextSlug}`}
              className="group block relative w-full h-[50vh] min-h-[360px] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-stroke focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <img
                src={nextProject.heroImage}
                alt={nextProject.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.4] group-hover:brightness-50 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/30 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16">
                <span className="text-xs text-muted font-mono uppercase tracking-[0.3em] mb-4">Next Project</span>
                <div className="flex items-end justify-between gap-6">
                  <h3 className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary leading-[0.9]">{nextProject.title}</h3>
                  <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full border border-stroke bg-bg/40 backdrop-blur-md flex items-center justify-center text-text-primary group-hover:bg-text-primary group-hover:text-bg transition-colors duration-300">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}
      </div>

      {/* Fullscreen image viewer */}
      <Lightbox
        images={project.visuals}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}
