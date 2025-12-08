import { motion } from 'framer-motion';
import { ArrowRight01Icon, Github01Icon, ZapIcon, Shield01Icon, CloudIcon, Book02Icon, Download04Icon, CheckmarkCircle02Icon } from 'hugeicons-react';
import { useState, useEffect } from 'react';

export const Hero = ({ onGetStarted }) => {
  const [githubStars, setGithubStars] = useState(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/ezDecode/S3Zen-CloudCore')
      .then(res => res.json())
      .then(data => setGithubStars(data.stargazers_count))
      .catch(() => setGithubStars(null));
  }, []);

  const features = [
    { icon: ZapIcon, label: 'Lightning Fast' },
    { icon: Shield01Icon, label: '100% Secure' },
    { icon: CloudIcon, label: 'Zero Config' },
  ];

  const scrollToSetupGuide = () => {
    const faqSection = document.getElementById('setup-guide');
    if (faqSection) {
      // Use Lenis scrollTo if available, fallback to native smooth scroll
      if (window.lenis) {
        window.lenis.scrollTo(faqSection, {
          offset: 0,
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        faqSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="hero-page-wrapper relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-black">
      {/* Enhanced Linear-inspired Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Primary gradient orb */}
        <div className="absolute w-[1000px] h-[1000px] bg-gradient-to-br from-purple-500/[0.08] via-blue-500/[0.05] to-transparent rounded-full blur-3xl top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
        
        {/* Secondary gradient orb */}
        <div className="absolute w-[800px] h-[800px] bg-gradient-to-tl from-cyan-500/[0.06] via-emerald-500/4 to-transparent rounded-full blur-3xl bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Accent orb */}
        <div className="absolute w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-size-[60px_60px]" />

      <main className="relative z-10 flex flex-col items-center justify-center w-full sm:w-[90%] lg:w-[80%] max-w-6xl mx-auto text-center h-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        
        {/* Version Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full mb-6 sm:mb-8"
        >
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/70">v2.0 Now Available</span>
        </motion.div>

        {/* Main Heading with Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6 mx-auto max-w-5xl"
        >
          <div className="text-[clamp(1.75rem,5.5vw,4.4rem)] leading-[1.15] tracking-[-0.02em] font-normal px-2">
            <span className="text-white">CloudCore is a </span>
            <span className="text-white">purpose-built tool for managing AWS S3 storage</span>
          </div>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="text-[clamp(0.95rem,1.575vw,1.3125rem)] text-white/60 font-normal mb-8 sm:mb-10 mx-auto leading-relaxed max-w-4xl px-2"
        >
          Experience lightning-fast uploads, intuitive drag-and-drop interface, and enterprise-grade security—all without leaving your browser. No account needed. No data leaves your browser. Just paste your AWS credentials and start managing your S3 buckets like a pro.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-row items-center justify-center gap-3 w-full max-w-2xl px-4 sm:px-0 mb-10 sm:mb-12"
        >
          <button
            onClick={onGetStarted}
            className="group bg-white text-black rounded-xl hover:bg-white/90 transition-colors duration-150 px-6 py-3.5 text-base font-medium shadow-lg flex items-center justify-center flex-1 min-[901px]:min-w-[160px]"
          >
            Get Started
            <ArrowRight01Icon className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={scrollToSetupGuide}
            className="bg-white/[0.05] text-white/90 border border-white/[0.1] rounded-xl hover:bg-white/[0.08] hover:border-white/[0.15] transition-colors duration-150 px-6 max-[900px]:px-4 py-3.5 text-base flex items-center justify-center flex-1 max-[900px]:flex-initial max-[900px]:min-w-0 min-[901px]:min-w-[160px]"
          >
            <Book02Icon className="w-4 h-4 max-[900px]:mx-0 min-[901px]:mr-2" />
            <span className="max-[900px]:hidden">Setup Guide</span>
          </button>

          <a
            href="https://github.com/ezDecode/S3Zen-CloudCore"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/[0.05] text-white/90 border border-white/[0.1] rounded-xl hover:bg-white/[0.08] hover:border-white/[0.15] transition-colors duration-150 px-6 max-[900px]:px-4 py-3.5 text-base flex items-center justify-center flex-1 max-[900px]:flex-initial max-[900px]:min-w-0 min-[901px]:min-w-[160px]"
          >
            <Github01Icon className="w-4 h-4 max-[900px]:mx-0 min-[901px]:mr-2" />
            <span className="max-[900px]:hidden">See the Docs</span>
          </a>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10 px-4"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1.5"
            >
              <feature.icon className="w-3 h-3 text-white/50" />
              <span className="text-xs text-white/60">{feature.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 px-4"
        >
          <div className="flex items-center gap-2">
            <Github01Icon className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/60">
              <span className="text-white font-medium">{githubStars ? `${githubStars}+` : '...'}</span> stars
            </span>
          </div>
          
          <div className="w-px h-4 bg-white/[0.1]" />
          
          <div className="flex items-center gap-2">
            <Download04Icon className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/60">
              <span className="text-white font-medium">100%</span> free
            </span>
          </div>
          
          <div className="w-px h-4 bg-white/[0.1]" />
          
          <div className="flex items-center gap-2">
            <CheckmarkCircle02Icon className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/60">
              <span className="text-white font-medium">Open</span> source
            </span>
          </div>
        </motion.div>

      </main>
    </div>
  );
};