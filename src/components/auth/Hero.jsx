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
        <div className="absolute w-[800px] h-[800px] bg-gradient-to-tl from-cyan-500/[0.06] via-emerald-500/[0.04] to-transparent rounded-full blur-3xl bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Accent orb */}
        <div className="absolute w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-size-[60px_60px]" />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mx-auto text-center h-full px-4 sm:px-6 lg:px-8 py-20">
        {/* Top Row: Badge + Metrics */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/4 backdrop-blur-md border border-white/8 rounded-full hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors duration-200">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-sans text-white/90 tracking-wide" style={{ fontWeight: '400' }}>
              v2.0 Now Available
            </span>
          </div>

          {/* Inline Metrics */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <Github01Icon className="w-3.5 h-3.5 text-white/60" />
              <span className="text-xs text-white/80">{githubStars ? `${githubStars}+` : '...'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <Download04Icon className="w-3.5 h-3.5 text-white/60" />
              <span className="text-xs text-white/80">100% Free</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <CheckmarkCircle02Icon className="w-3.5 h-3.5 text-white/60" />
              <span className="text-xs text-white/80">Open Source</span>
            </div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="font-sans mb-6"
          style={{
            fontSize: 'clamp(3.5rem, 12vw, 13rem)',
            lineHeight: '0.9',
            letterSpacing: '-0.04em',
            fontWeight: '400'
          }}
        >
          <span className="text-white">Cloud</span>
          <span className="text-white/40">Core</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="font-sans text-white/70 mb-5 tracking-tight max-w-3xl"
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 3rem)',
            fontWeight: '400',
            lineHeight: '1.2'
          }}
        >
          S3 management that doesn't suck
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="font-sans w-full max-w-xl mx-auto text-white/50 mb-8 leading-relaxed text-base sm:text-lg"
          style={{ fontWeight: '400' }}
        >
          Because life's too short for the AWS Console. Fast uploads, drag-and-drop magic, and your secrets stay secret.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.08, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors duration-150"
            >
              <feature.icon className="w-3 h-3 text-white/60" />
              <span className="text-xs text-white/70" style={{ fontWeight: '400' }}>
                {feature.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <button
            onClick={onGetStarted}
            className="group text-black rounded-xl bg-white hover:bg-white/90 transition-colors duration-150 shadow-lg flex items-center justify-center px-8 py-4 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
          >
            Get Started
            <ArrowRight01Icon className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={scrollToSetupGuide}
            className="text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.15] rounded-xl transition-colors duration-150 flex items-center justify-center px-6 py-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
          >
            <Book02Icon className="w-4 h-4 mr-2" />
            Setup Guide
          </button>

          <a
            href="https://github.com/ezDecode/S3Zen-CloudCore"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.15] rounded-xl transition-colors duration-150 flex items-center justify-center px-6 py-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
          >
            <Github01Icon className="w-4 h-4 mr-2" />
            Star on GitHub
          </a>
        </motion.div>

        {/* Bottom Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/[0.06] rounded-full"
        >
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/50">
            No account • Runs in browser • 100% Private
          </span>
        </motion.div>
      </main>
    </div>
  );
};