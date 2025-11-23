import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Zap, Shield, Cloud } from 'lucide-react';

export const Hero = ({ onGetStarted }) => {
  const features = [
    { icon: Zap, label: 'Lightning Fast' },
    { icon: Shield, label: '100% Secure' },
    { icon: Cloud, label: 'Zero Config' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen overflow-hidden">
      {/* Subtle Background Blobs */}
      <div className="absolute w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl bottom-0 right-0 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl px-6 mx-auto text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs font-medium text-white/80">v2.0 Now Available</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-7xl md:text-8xl lg:text-9xl font-serif font-normal"
          style={{ marginBottom: '24px' }}
        >
          <span className="gradient-text">Cloud</span>
          <span className="text-white">Core</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-2xl md:text-3xl font-light text-white/90"
          style={{ marginBottom: '16px' }}
        >
          Premium AWS S3 Management
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-3xl mx-auto text-lg text-white/70"
          style={{ marginBottom: '48px' }}
        >
          The most beautiful way to manage your S3 buckets. Lightning-fast uploads, intuitive<br />
          organization, and enterprise-grade security.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center"
          style={{ gap: '12px', marginBottom: '48px' }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center bg-white/5 border border-white/10 rounded-full"
              style={{ gap: '8px', padding: '8px 16px' }}
            >
              <feature.icon className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white/80">{feature.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center"
          style={{ gap: '16px' }}
        >
          <button
            onClick={onGetStarted}
            className="group text-base font-semibold text-white rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/30 flex items-center"
            style={{ padding: '16px 32px', gap: '8px' }}
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <a
            href="https://github.com/ezDecode/S3Zen-CloudCore"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all flex items-center"
            style={{ padding: '16px 32px', gap: '8px' }}
          >
            <Github className="w-5 h-5" />
            <span>Star on GitHub</span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 max-w-2xl"
          style={{ gap: '32px', marginTop: '64px' }}
        >
          {[
            { value: '100K+', label: 'Files Managed' },
            { value: '99.9%', label: 'Uptime' },
            { value: '5TB+', label: 'Data Transferred' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold gradient-text" style={{ marginBottom: '8px' }}>{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-xs text-white/30 font-medium tracking-wider">
          Built By ❤️ BY @ezDecode
        </p>
      </div>
    </div>
  );
};