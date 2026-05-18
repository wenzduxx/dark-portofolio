import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Zap, Info } from 'lucide-react';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activitiesMap: ACTIVITIES, loading } = usePortfolioData();
  const activity = id ? ACTIVITIES[id] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!loading && !activity) {
      navigate('/');
    }
  }, [activity, navigate, loading]);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!activity) return null;

  return (
    <div className="bg-bg min-h-screen pt-32 pb-40">
      <div className="max-w-[1000px] mx-auto px-6">
        <Link 
          to="/resume" 
          className="inline-flex items-center gap-2 text-muted hover:text-text-primary transition-colors mb-16 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Insights
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Header Info */}
          <div className="lg:col-span-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 text-xs font-mono text-muted uppercase tracking-widest mb-6">
                <span className="flex items-center gap-2 text-accent">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   {activity.type}
                </span>
                <span className="w-8 h-px bg-stroke" />
                {activity.status}
              </div>
              <h1 className="text-5xl md:text-8xl font-display italic text-text-primary mb-8">
                {activity.title}
              </h1>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <section className="bg-surface/50 border border-stroke rounded-[3rem] p-8 md:p-16 backdrop-blur-xl mb-12">
              <div className="flex items-center gap-3 mb-10">
                <Info className="w-4 h-4 text-muted" />
                <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Full Context</h2>
              </div>
              <p className="text-2xl text-text-primary/90 leading-relaxed font-light italic mb-12">
                {activity.longDescription}
              </p>
              
              {activity.impact && (
                <div className="p-8 bg-bg/50 rounded-2xl border border-stroke">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-4 h-4 text-accent" />
                    <h3 className="text-xs text-muted uppercase tracking-widest">Impact & Outcomes</h3>
                  </div>
                  <p className="text-muted leading-relaxed">
                    {activity.impact}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                <h3 className="text-xs text-muted uppercase tracking-[0.2em] mb-6">Details</h3>
                <div className="space-y-6">
                   <div>
                     <div className="text-[10px] text-muted uppercase mb-1">Timeline</div>
                     <div className="text-text-primary">{activity.date}</div>
                   </div>
                   {activity.links && activity.links.length > 0 && (
                     <div>
                       <div className="text-[10px] text-muted uppercase mb-3">Resources</div>
                       <div className="space-y-3">
                         {activity.links.map(link => (
                           <a key={link.label} href={link.url} className="flex items-center gap-2 text-sm text-text-primary hover:text-accent transition-colors">
                             {link.label} <ExternalLink className="w-3 h-3" />
                           </a>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
              </div>

              {/* Decorative graphic */}
              <div className="aspect-square rounded-[2rem] overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/5 flex items-center justify-center p-12">
                 <div className="w-full h-full rounded-full border border-stroke opacity-20 animate-[spin_10s_linear_infinite]" />
                 <div className="absolute w-1/2 h-1/2 rounded-full border border-accent opacity-40 animate-[spin_6s_linear_infinite_reverse]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
