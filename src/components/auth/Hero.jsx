import { motion } from 'framer-motion';
import { ArrowRight01Icon, Github01Icon, ZapIcon, Shield01Icon, CloudIcon, Book02Icon, Download04Icon, CheckmarkCircle02Icon } from 'hugeicons-react';
import { useState, useEffect } from 'react';

export const Hero = ({ onGetStarted }) => {
  const [githubStars, setGithubStars] = useState(null);

  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_GITHUB_FETCH_DEV !== 'true') return;
    let aborted = false;
    fetch('https://api.github.com/repos/ezDecode/S3Zen-CloudCore', { headers: { Accept: 'application/vnd.github+json' } })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (!aborted && data) setGithubStars(data.stargazers_count); })
      .catch(() => { });
    return () => { aborted = true; };
  }, []);

  const features = [
    { icon: ZapIcon, label: 'Fast' },
    { icon: Shield01Icon, label: 'Secure' },
    { icon: CloudIcon, label: 'Simple' },
  ];

  const scrollToSetupGuide = () => {
    const el = document.getElementById('setup-guide');
    if (el) window.lenis ? window.lenis.scrollTo(el, { duration: 1.5 }) : el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hero-page-wrapper relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-[1000px] h-[1000px] bg-gradient-to-br from-purple-500/[0.08] via-blue-500/[0.05] to-transparent rounded-full blur-3xl top-0 left-1/4 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-[800px] h-[800px] bg-gradient-to-tl from-cyan-500/[0.06] to-transparent rounded-full blur-3xl bottom-0 right-1/4 translate-x-1/2 translate-y-1/2" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl mx-auto text-center h-full px-4 py-12">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/70">v2.0</span>
        </motion.div>

        {/* Heading */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-6 mx-auto">
          <div className="text-[clamp(1.75rem,5.5vw,4rem)] leading-[1.15] tracking-[-0.02em] font-normal text-white">
            AWS S3 File Manager
          </div>
        </motion.h1>

        {/* Description */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-white/60 mb-8 mx-auto max-w-2xl">
          Fast uploads, drag-and-drop, enterprise security. No backend needed. Your credentials never leave the browser.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-row items-center justify-center gap-3 mb-10">
          <button onClick={onGetStarted}
            className="group bg-white text-black rounded-xl hover:bg-white/90 transition-colors px-6 py-3.5 font-medium flex items-center">
            Get Started <ArrowRight01Icon className="w-4 h-4 ml-2" />
          </button>
          <button onClick={scrollToSetupGuide}
            className="bg-white/[0.05] text-white/90 border border-white/[0.1] rounded-xl hover:bg-white/[0.08] px-4 py-3.5">
            <Book02Icon className="w-4 h-4" />
          </button>
          <a href="https://github.com/ezDecode/S3Zen-CloudCore" target="_blank" rel="noopener noreferrer"
            className="bg-white/[0.05] text-white/90 border border-white/[0.1] rounded-xl hover:bg-white/[0.08] px-4 py-3.5">
            <Github01Icon className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-2 mb-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1.5">
              <f.icon className="w-3 h-3 text-white/50" />
              <span className="text-xs text-white/60">{f.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex items-center gap-6 text-sm text-white/60">
          <span><Github01Icon className="w-4 h-4 inline mr-1" />{githubStars || '...'} stars</span>
          <span className="w-px h-4 bg-white/10" />
          <span><Download04Icon className="w-4 h-4 inline mr-1" />Free</span>
          <span className="w-px h-4 bg-white/10" />
          <span><CheckmarkCircle02Icon className="w-4 h-4 inline mr-1" />Open Source</span>
        </motion.div>
      </main>
    </div>
  );
};