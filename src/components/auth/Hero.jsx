
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

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mx-auto text-center h-full overflow-y-auto px-4 sm:px-6 lg:px-8">
        <header className="w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6 sm:mb-8 md:mb-10"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />
            <span 
              className="text-xs sm:text-sm font-bold text-white/80"
              style={{ fontFamily: 'Watson, sans-serif' }}
            >
              v2.0 Now Available
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-bold mb-4 sm:mb-6 md:mb-8"
            style={{ 
              fontFamily: 'Watson, sans-serif', 
              fontSize: 'clamp(3rem, 10vw + 1rem, 11rem)', 
              lineHeight: '0.95',
              letterSpacing: '-0.02em'
            }}
          >
            <span className="gradient-text">Cloud</span>
            <span className="text-white">Core</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-medium text-white/90 mb-3 sm:mb-4"
            style={{ 
              fontFamily: 'Watson, sans-serif', 
              fontSize: 'clamp(1.3rem, 2.5vw + 0.5rem, 2.5rem)'
            }}
          >
            Premium AWS S3 Management
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-2xl mx-auto text-white/80 mb-8 sm:mb-10 md:mb-12 leading-relaxed font-medium"
            style={{ 
              fontFamily: 'Watson, sans-serif', 
              fontSize: 'clamp(1.15rem, 1.8vw + 0.4rem, 1.6rem)',
              fontWeight: '500'
            }}
          >
            The most beautiful way to manage your S3 buckets. Lightning-fast uploads, intuitive organization, and enterprise-grade security.
          </motion.p>
        </header>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12"
          role="list"
          aria-label="Key features"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              role="listitem"
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2"
              style={{ fontFamily: 'Watson, sans-serif' }}
            >
              <feature.icon className="w-4 h-4 text-purple-400" aria-hidden="true" />
              <span 
                className="font-medium text-white/80" 
                style={{ fontSize: 'clamp(0.95rem, 1.2vw + 0.2rem, 1.1rem)' }}
              >
                {feature.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-row items-stretch justify-center w-full max-w-3xl gap-3 sm:gap-4"
        >
          {/* Get Started Button */}
          <button
            onClick={onGetStarted}
            className="group font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/30 flex items-center justify-center flex-1 px-6 sm:px-8 py-3.5 sm:py-4"
            aria-label="Get started with CloudCore"
            style={{ 
              fontFamily: 'Watson, sans-serif', 
              fontSize: 'clamp(1rem, 1.5vw + 0.2rem, 1.15rem)',
              gap: '0.5rem',
              maxWidth: '280px'
            }}
          >
            <span className="whitespace-nowrap">Get Started</span>
            <ArrowRight01Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>

          {/* Setup Guide Button */}
          <button
            onClick={onShowSetupGuide}
            className="font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center px-5 sm:px-8 py-3.5 sm:py-4"
            aria-label="View AWS setup guide"
            style={{ 
              fontFamily: 'Watson, sans-serif', 
              fontSize: 'clamp(1rem, 1.5vw + 0.2rem, 1.15rem)',
              gap: '0.5rem',
              minWidth: 'auto'
            }}
          >
            <Book02Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            <span className="hidden sm:inline whitespace-nowrap">Setup Guide</span>
          </button>

          {/* GitHub Button */}
          <a
            href="https://github.com/ezDecode/S3Zen-CloudCore"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center px-5 sm:px-8 py-3.5 sm:py-4"
            aria-label="Star CloudCore on GitHub"
            style={{ 
              fontFamily: 'Watson, sans-serif', 
              fontSize: 'clamp(1rem, 1.5vw + 0.2rem, 1.15rem)',
              gap: '0.5rem',
              minWidth: 'auto'
            }}
          >
            <Github01Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            <span className="hidden sm:inline whitespace-nowrap">Star on GitHub</span>
          </a>
        </motion.div>
      </main>

      <footer className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center z-10 px-4">
        <p 
          className="text-white/30 font-medium tracking-wider" 
          style={{ 
            fontFamily: 'Watson, sans-serif', 
            fontSize: 'clamp(0.9rem, 1.2vw + 0.2rem, 1.05rem)'
          }}
        >
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