
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
      {/* Premium Monochromatic Background */}
      <div className="absolute w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
      <div className="absolute w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-3xl bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 pointer-events-none z-0" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:60px_60px]" />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mx-auto text-center h-full overflow-y-auto px-4 sm:px-6 lg:px-8">
        <header className="w-full">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-full mb-6 sm:mb-8 md:mb-10 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-medium text-white/90 tracking-wide">
              v2.0 Now Available
            </span>
          </motion.div>

          {/* Premium Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="font-regular mb-4 sm:mb-6 md:mb-8"
            style={{
              fontSize: 'clamp(3rem, 10vw + 1rem, 11rem)',
              lineHeight: '0.95',
              letterSpacing: '-0.03em',
              fontWeight: '600'
            }}
          >
            <span className="text-white">Cloud</span>
            <span className="text-white/40">Core</span>
          </motion.h1>

          {/* Premium Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="font-regular text-white/70 mb-3 sm:mb-4 tracking-tight"
            style={{
              fontSize: 'clamp(1.3rem, 2.5vw + 0.5rem, 2.5rem)',
              fontWeight: '500'
            }}
          >
            Premium AWS S3 Management
          </motion.p>

          {/* Premium Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl mx-auto text-white/50 mb-8 sm:mb-10 md:mb-12 leading-relaxed"
            style={{
              fontSize: 'clamp(1.05rem, 1.6vw + 0.3rem, 1.4rem)',
              fontWeight: '400',
              letterSpacing: '-0.01em'
            }}
          >
            The most beautiful way to manage your S3 buckets. Lightning-fast uploads, intuitive organization, and enterprise-grade security.
          </motion.p>
        </header>

        {/* Premium Feature Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12"
          role="list"
          aria-label="Key features"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              role="listitem"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.08] rounded-full px-5 py-2.5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-default"
            >
              <feature.icon className="w-4 h-4 text-white/60" aria-hidden="true" />
              <span
                className="font-medium text-white/70"
                style={{ fontSize: 'clamp(0.9rem, 1.1vw + 0.2rem, 1.05rem)', letterSpacing: '-0.01em' }}
              >
                {feature.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile-First CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center w-full max-w-3xl gap-3 sm:gap-4 px-4"
        >
          {/* Mobile-First Get Started Button */}
          <button
            onClick={onGetStarted}
            className="group w-full sm:w-auto text-black rounded-xl bg-white hover:opacity-90 transition-opacity duration-150 shadow-lg flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 active:scale-[0.99] touch-target"
            aria-label="Get started with CloudCore"
          >
            <span className="text-sm sm:text-base font-medium whitespace-nowrap">Get Started</span>
            <ArrowRight01Icon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>

          {/* Mobile-First Icon Buttons Container */}
          <div className="flex items-stretch gap-3 sm:gap-4">
            {/* Setup Guide Button */}
            <button
              onClick={onShowSetupGuide}
              className="flex-1 sm:flex-none text-white bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-150 flex items-center justify-center px-4 sm:px-6 py-3.5 sm:py-4 active:scale-[0.99] touch-target"
              aria-label="View AWS setup guide"
            >
              <Book02Icon className="w-5 h-5" aria-hidden="true" />
              <span className="ml-2 text-sm sm:text-base font-medium sm:hidden">Guide</span>
              <span className="ml-2 text-sm sm:text-base font-medium hidden sm:inline whitespace-nowrap">Setup Guide</span>
            </button>

            {/* GitHub Button */}
            <a
              href="https://github.com/ezDecode/S3Zen-CloudCore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none text-white bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-150 flex items-center justify-center px-4 sm:px-6 py-3.5 sm:py-4 active:scale-[0.99] touch-target"
              aria-label="Star CloudCore on GitHub"
            >
              <Github01Icon className="w-5 h-5" aria-hidden="true" />
              <span className="ml-2 text-sm sm:text-base font-medium sm:hidden">GitHub</span>
              <span className="ml-2 text-sm sm:text-base font-medium hidden sm:inline whitespace-nowrap">Star on GitHub</span>
            </a>
          </div>
        </motion.div>
      </main>

      <footer className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center z-10 px-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="text-white/30 font-medium tracking-wide"
          style={{
            fontSize: 'clamp(0.85rem, 1.1vw + 0.2rem, 1rem)',
            letterSpacing: '0.02em'
          }}
        >
          Developed by{' '}
          <a
            href="https://github.com/ezDecode"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 transition-colors duration-300 underline decoration-white/10 hover:decoration-white/30"
          >
            @ezDecode
          </a>
        </motion.p>
      </footer>
    </div>
  );
};