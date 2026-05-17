import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Award, BookOpen, ChevronRight, Download, Mail, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import TextType from '../components/TextType';
import Noise from '../components/Noise';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

gsap.registerPlugin(ScrollTrigger);

export default function Resume() {
  const { education: EDUCATION, resumeData, contact } = usePortfolioData();
  const SKILL_COLUMNS = resumeData.skillColumns;
  const ALL_CERTIFICATIONS = resumeData.certifications;

  const [certIndex, setCertIndex] = useState(0);
  const [skillIndices, setSkillIndices] = useState([0, 0, 0]);

  // Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const handleSentenceComplete = (colIndex: number, sentenceIndex: number) => {
    setSkillIndices(prev => {
      const next = [...prev];
      next[colIndex] = (sentenceIndex + 1) % SKILL_COLUMNS[colIndex].length;
      return next;
    });
  };

  useEffect(() => {
    if (ALL_CERTIFICATIONS.length === 0) return;
    const certTimer = setInterval(() => {
      setCertIndex((prev) => (prev + 3 >= ALL_CERTIFICATIONS.length ? 0 : prev + 3));
    }, 6000);
    return () => clearInterval(certTimer);
  }, [ALL_CERTIFICATIONS.length]);

  const visibleCerts = ALL_CERTIFICATIONS.slice(certIndex, certIndex + 3);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Reveal animations
      gsap.from(".resume-reveal", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".resume-reveal",
          start: "top 85%",
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const formspreeId = resumeData.formspreeId;

    if (!formspreeId) {
      // Fallback to mailto:
      const mailtoBody = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0ASubject: ${formData.subject}%0D%0A%0D%0A${formData.message}`;
      const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(formData.subject || 'Contact from Portfolio')}&body=${mailtoBody}`;
      window.open(mailtoUrl, '_blank');
      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 3000);
      return;
    }

    // Formspree submission
    setFormStatus('sending');
    setFormError('');

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setFormStatus('idle'), 4000);
      } else {
        const data = await response.json();
        setFormError(data?.errors?.[0]?.message || 'Failed to send message. Please try again.');
        setFormStatus('error');
        setTimeout(() => setFormStatus('idle'), 4000);
      }
    } catch {
      setFormError('Network error. Please try again.');
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  const setField = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [k]: e.target.value }));
    if (formError) setFormError('');
  };

  return (
    <div className="bg-bg min-h-screen pt-32 pb-20 relative">
      <Noise
        patternSize={250}
        patternScaleX={1}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={15}
      />
      {/* About Me Section */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 mb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-12 lg:col-span-4">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 1 }}
               className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">About Me</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-display italic text-text-primary leading-none mb-12">
              A curious <span className="text-text-primary/40">mind.</span>
            </h1>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="relative w-48 h-48 md:w-64 md:h-64 rounded-full group"
            >
              {/* Outer decorative ring */}
              <div className="absolute inset-[-8px] rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm -z-10 animate-[pulse_8s_linear_infinite]" />
              
              <div className="w-full h-full rounded-full overflow-hidden border border-stroke bg-surface relative grayscale hover:grayscale-0 transition-all duration-1000">
                 <img 
                   src={resumeData.profileImage}
                   alt="Profile" 
                   className="w-full h-full object-cover"
                 />
                 {/* Glass overlay */}
                 <div className="absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent opacity-60" />
              </div>
            </motion.div>
          </div>
          <div className="md:col-span-12 lg:col-span-8">
            <div className="text-xl md:text-2xl text-text-primary/80 leading-relaxed max-w-3xl">
              <p className="mb-8">
                {resumeData.bioParagraph1}
              </p>
              <p className="mb-8">
                {resumeData.bioParagraph2}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 mt-12 pt-12 border-t border-stroke">
                <div>
                  <div className="text-[10px] text-muted uppercase tracking-[0.2em] mb-1">Current Location</div>
                  <div className="text-lg text-text-primary">{resumeData.location}</div>
                </div>
                {resumeData.cvUrl ? (
                  <a 
                    href={resumeData.cvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative rounded-full text-sm hover:scale-105 transition-all duration-300"
                  >
                    <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative px-8 py-3 rounded-full bg-text-primary group-hover:bg-bg text-bg group-hover:text-text-primary transition-colors duration-300 z-10 flex items-center gap-2">
                      Download CV <Download className="w-4 h-4" />
                    </div>
                  </a>
                ) : (
                  <a 
                    href={`mailto:${contact.email}`}
                    className="group relative rounded-full text-sm hover:scale-105 transition-all duration-300"
                  >
                    <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative px-8 py-3 rounded-full bg-text-primary group-hover:bg-bg text-bg group-hover:text-text-primary transition-colors duration-300 z-10 flex items-center gap-2">
                      Get in Touch <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        {/* Education Section */}
        <section className="resume-reveal mb-32">
          <div className="flex items-center gap-3 mb-12">
            <BookOpen className="w-5 h-5 text-muted" />
            <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Academic Journey</h2>
            <div className="flex-1 h-px bg-stroke" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {EDUCATION.map((item, i) => (
              <Link 
                key={i} 
                to={`/academic/${item.id}`}
                className="group relative p-8 md:p-12 rounded-[3rem] bg-surface/50 border border-stroke hover:bg-surface transition-all duration-500 overflow-hidden block"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="text-[120px] font-display italic leading-none select-none">0{i+1}</div>
                </div>
                
                <div className="relative z-10">
                  <div className="text-xs font-mono text-muted mb-4 uppercase tracking-widest">{item.year}</div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-display italic text-text-primary mb-4 leading-tight group-hover:text-white transition-colors">
                    {item.degree}
                  </h3>
                  <div className="flex items-center gap-3 text-lg text-muted">
                    <span className="w-6 h-px bg-stroke" />
                    {item.school}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-32">
          {/* Certifications */}
          <section className="resume-reveal md:col-span-12 lg:col-span-4">
            <div className="flex items-center gap-3 mb-10">
              <Award className="w-4 h-4 text-muted" />
              <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Certifications</h2>
              <div className="flex-1 h-px bg-stroke" />
            </div>
            <div className="min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={certIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                   {visibleCerts.map((item, i) => (
                     <div key={i} className="flex items-center justify-between group p-4 rounded-2xl hover:bg-surface/50 transition-colors">
                        <div>
                          <h3 className="text-lg text-text-primary group-hover:text-white transition-colors">{item.title}</h3>
                          <span className="text-sm text-muted">{item.issuer}</span>
                        </div>
                        <span className="text-xs text-muted font-mono">{item.date}</span>
                     </div>
                   ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Competencies */}
          <section className="resume-reveal md:col-span-12 lg:col-span-8">
            <div className="flex items-center gap-3 mb-10">
              <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Specialized Skills</h2>
              <div className="flex-1 h-px bg-stroke" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {SKILL_COLUMNS.map((column, i) => (
                <div key={i} className="min-h-[220px]">
                  <h3 className="text-xs text-accent uppercase tracking-wider mb-6 font-mono">
                    <TextType 
                      text={column.map(c => c.category)}
                      onSentenceComplete={(sentence, idx) => handleSentenceComplete(i, idx)}
                      pauseDuration={5000}
                      typingSpeed={50}
                      deletingSpeed={30}
                    />
                  </h3>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={skillIndices[i]}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ul className="space-y-4">
                        {column[skillIndices[i]]?.items.map((skill, j) => (
                          <li key={j} className="flex items-center gap-2 text-base md:text-lg text-text-primary group cursor-default whitespace-nowrap">
                            <ChevronRight className="w-3 h-3 text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Contact Form */}
        <section className="resume-reveal max-w-4xl mx-auto bg-surface border border-stroke rounded-[3rem] p-8 md:p-16">
          <div className="text-center mb-12">
            <div className="inline-flex p-3 rounded-full bg-stroke/30 mb-6">
              <Mail className="w-6 h-6 text-text-primary/70" />
            </div>
            <h2 className="text-4xl md:text-5xl font-display italic text-text-primary mb-4">{resumeData.formHeading}</h2>
            <p className="text-muted">{resumeData.formSubtext}</p>
          </div>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {formStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-6 py-4 mb-8"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-green-400">Message sent successfully! I'll get back to you soon.</span>
              </motion.div>
            )}
            {formStatus === 'error' && formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 mb-8"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-red-400">{formError}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-muted uppercase tracking-widest ml-4">Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={setField('name')}
                  placeholder="John Doe" 
                  required
                  className="w-full bg-bg border border-stroke rounded-full px-6 py-4 text-text-primary focus:border-white transition-colors outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted uppercase tracking-widest ml-4">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={setField('email')}
                  placeholder="john@example.com" 
                  required
                  className="w-full bg-bg border border-stroke rounded-full px-6 py-4 text-text-primary focus:border-white transition-colors outline-none" 
                />
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-xs text-muted uppercase tracking-widest ml-4">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={setField('subject')}
                  placeholder="How can I help?" 
                  className="w-full bg-bg border border-stroke rounded-full px-6 py-4 text-text-primary focus:border-white transition-colors outline-none" 
                />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted uppercase tracking-widest ml-4">Message *</label>
              <textarea 
                rows={5}
                name="message"
                value={formData.message}
                onChange={setField('message')}
                placeholder="Tell me about your project..." 
                required
                className="w-full bg-bg border border-stroke rounded-[2rem] px-6 py-6 text-text-primary focus:border-white transition-colors outline-none resize-none" 
              />
            </div>
            
            <button 
              type="submit"
              disabled={formStatus === 'sending'}
              className="w-full group relative rounded-full text-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
            >
               <span className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative w-full h-full bg-text-primary hover:bg-transparent text-bg hover:text-text-primary py-5 rounded-full flex items-center justify-center gap-3 transition-all z-10 transition-colors duration-300">
                 {formStatus === 'sending' ? (
                   <>
                     <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                     Sending...
                   </>
                 ) : formStatus === 'success' ? (
                   <>
                     <CheckCircle2 className="w-4 h-4" />
                     Sent!
                   </>
                 ) : (
                   <>
                     Send Message <Send className="w-4 h-4" />
                   </>
                 )}
               </div>
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
