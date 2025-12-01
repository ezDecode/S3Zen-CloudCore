/**
 * useLenis Hook
 * Site-wide smooth scrolling with Lenis
 */

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export const useLenis = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis with optimized settings
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Expose Lenis instance globally for easy access
    window.lenis = lenis;

    // Add lenis class to html element
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    // Request animation frame loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
      window.lenis = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, []);

  // Expose scrollTo method for programmatic scrolling
  const scrollTo = (target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: 0,
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        ...options,
      });
    }
  };

  return { scrollTo, lenis: lenisRef.current };
};
