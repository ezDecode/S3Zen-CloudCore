
import { motion } from 'framer-motion';
import { ArrowRight01Icon, Github01Icon, ZapIcon, Shield01Icon, CloudIcon, Book02Icon } from 'hugeicons-react';

export const Hero = ({ onGetStarted, onShowSetupGuide }) => {
  const features = [
    { icon: ZapIcon, label: 'Lightning Fast' },
    { icon: Shield01Icon, label: '100% Secure' },
    { icon: CloudIcon, label: 'Zero Config' },
  ];

  return (
    <div className="hero-page-wrapper relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-black">
      {/* Subtle Background Blobs - Contained within hero wrapper */}
      <div className="absolute w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
      <div className="absolute w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl bottom-0 right-0 translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

      {/* Grid Pattern - Contained within hero wrapper */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]" />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl px-4 sm:px-6 mx-auto text-center h-full overflow-y-auto">
        <header>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full"
            style={{ gap: '0.43rem', marginBottom: 'clamp(1rem, 3vh, 2rem)' }}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />
            <span className="text-xs sm:text-sm md:text-md font-bold text-white/80"
              style={{ fontFamily: 'Watson, sans-serif' }}
            >
              v2.0 Now Available</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-bold px-2"
            style={{ fontFamily: 'Watson, sans-serif', fontSize: 'clamp(3rem, 10vh, 10.8rem)', marginTop: 'clamp(0.3rem, 1vh, 1rem)', marginBottom: 'clamp(0.5rem, 1.5vh, 1.2rem)', lineHeight: '0.9' }}
          >
            <span className="gradient-text">Cloud</span>
            <span className="text-white">Core</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-medium text-white/90 px-2"
            style={{ fontFamily: 'Watson, sans-serif', fontSize: 'clamp(1.1rem, 3vh, 2.4rem)', marginBottom: 'clamp(0.3rem, 1vh, 0.7rem)' }}
          >
            Premium AWS S3 Management
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-3xl mx-auto text-white/70 px-2"
            style={{ fontFamily: 'Watson, sans-serif', fontSize: 'clamp(0.9rem, 2vh, 1.35rem)', marginBottom: 'clamp(1.2rem, 2.5vh, 2rem)', lineHeight: '1.4' }}
          >
            The most beautiful way to manage your S3 buckets. Lightning-fast uploads, intuitive
            <span className="hidden sm:inline"><br /></span>
            <span className="sm:hidden"> </span>
            organization, and enterprise-grade security.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center"
          style={{ gap: 'clamp(0.4rem, 1.5vw, 0.64rem)', marginBottom: 'clamp(1.5rem, 3vh, 2.5rem)' }}
          role="list"
          aria-label="Key features"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              role="listitem"
              className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2"
              style={{ fontFamily: 'Watson, sans-serif', gap: '0.43rem' }}
            >
              <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" aria-hidden="true" />
              <span className="font-medium text-white/80" style={{ fontSize: 'clamp(0.85rem, 2vw, 1.05rem)' }}>{feature.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-row items-stretch justify-center w-full px-2"
          style={{ gap: 'clamp(0.4rem, 1.5vw, 0.64rem)' }}
        >
          <button
            onClick={onGetStarted}
            className="group font-semibold text-white rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/30 flex items-center justify-center flex-1 sm:flex-initial px-2.5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4"
            aria-label="Get started with CloudCore"
            style={{ fontFamily: 'Watson, sans-serif', fontSize: 'clamp(0.85rem, 2.5vw, 1.2rem)', gap: 'clamp(0.2rem, 0.8vw, 0.43rem)' }}
          >
            <span className="whitespace-nowrap">Get Started</span>
            <ArrowRight01Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>

          <button
            onClick={onShowSetupGuide}
            className="font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all flex items-center justify-center px-2.5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4"
            aria-label="View AWS setup guide"
            style={{ fontFamily: 'Watson, sans-serif', fontSize: 'clamp(0.85rem, 2.5vw, 1.2rem)', gap: 'clamp(0.2rem, 0.8vw, 0.43rem)' }}
          >
            <Book02Icon className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" aria-hidden="true" />
            <span className="hidden sm:inline whitespace-nowrap">Setup Guide</span>
          </button>

          <a
            href="https://github.com/ezDecode/S3Zen-CloudCore"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all flex items-center justify-center px-2.5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4"
            aria-label="Star CloudCore on GitHub"
            style={{ fontFamily: 'Watson, sans-serif', fontSize: 'clamp(0.85rem, 2.5vw, 1.2rem)', gap: 'clamp(0.2rem, 0.8vw, 0.43rem)' }}
          >
            <Github01Icon className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" aria-hidden="true" />
            <span className="hidden sm:inline whitespace-nowrap">Star on GitHub</span>
          </a>
        </motion.div>
      </main>

      <footer className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-0 right-0 text-center z-10 px-4">
        <p className="text-white/30 font-medium tracking-wider" style={{ fontFamily: 'Watson, sans-serif', fontSize: 'clamp(0.75rem, 1.8vh, 1.1rem)' }}>
          Developed by{' '}
          <a
            href="https://github.com/ezDecode"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white/80 transition-colors underline decoration-white/20 hover:decoration-white/50"
          >
            @ezDecode
          </a>
        </p>
      </footer>
    </div>
  );
};