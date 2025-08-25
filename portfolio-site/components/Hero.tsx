'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroProps {
  titles: string[];
}

interface Metric {
  id: string;
  label: string;
  value: number;
  suffix: string;
  description: string;
}

interface MetricsData {
  metrics: Metric[];
}

function CountUpAnimation({ endValue, suffix, duration = 2000 }: { endValue: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * endValue);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [endValue, duration]);

  return (
    <span className="font-bold text-3xl md:text-4xl text-primary-600 dark:text-primary-400">
      {count}{suffix}
    </span>
  );
}

export default function Hero({ titles }: HeroProps) {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Rotating titles effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [titles.length]);

  // Load metrics data
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await fetch('/data/metrics.json');
        if (response.ok) {
          const data: MetricsData = await response.json();
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('Failed to load metrics:', error);
        // Fallback metrics
        setMetrics([
          { id: 'experience', label: 'Years Experience', value: 5, suffix: '+', description: 'Professional experience' },
          { id: 'projects', label: 'Projects', value: 50, suffix: '+', description: 'Completed projects' },
          { id: 'technologies', label: 'Technologies', value: 25, suffix: '+', description: 'Technologies mastered' },
          { id: 'satisfaction', label: 'Satisfaction', value: 98, suffix: '%', description: 'Client satisfaction' }
        ]);
      }
    };

    loadMetrics();
  }, []);

  // Trigger animations on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  } as const;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-dark-950 dark:to-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-100 dark:bg-grid-dark-800 bg-[size:60px_60px] opacity-20" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary-200 dark:bg-primary-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent-200 dark:bg-accent-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000" />

      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Main heading and rotating titles */}
        <motion.div 
          variants={itemVariants}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-dark-100 mb-4">
            Hi, I&apos;m{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Edikan Udoibuot
            </span>
          </h1>
          
          <div className="h-16 md:h-20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentTitleIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="text-2xl md:text-4xl font-medium text-gray-700 dark:text-dark-300"
              >
                {titles[currentTitleIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="text-lg md:text-xl text-gray-600 dark:text-dark-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          I craft exceptional digital experiences through clean code, innovative solutions, 
          and user-centered design. Let&apos;s build something amazing together.
        </motion.p>

        {/* Call to action buttons */}
        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link href="/case-studies">
            <motion.div
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View My Work
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.div>
          </Link>
          
          <motion.a
            href="#contact"
            className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-dark-600 text-gray-700 dark:text-dark-300 font-medium rounded-lg hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get In Touch
          </motion.a>
        </motion.div>

        {/* Metrics */}
        {metrics.length > 0 && (
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                className="text-center"
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <div className="mb-2">
                  <CountUpAnimation 
                    endValue={metric.value} 
                    suffix={metric.suffix}
                    duration={2000 + index * 200}
                  />
                </div>
                <div className="text-sm md:text-base font-medium text-gray-700 dark:text-dark-300 mb-1">
                  {metric.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-dark-500">
                  {metric.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-dark-500 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 dark:bg-dark-500 rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}