'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineItem {
  id: string;
  year: string;
  title: string;
  company: string;
  location: string;
  description: string;
  highlights: string[];
  technologies: string[];
  expanded: boolean;
}

interface TimelineData {
  timeline: TimelineItem[];
}

export default function Timeline() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load timeline data
  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const response = await fetch('/data/timeline.json');
        if (response.ok) {
          const data: TimelineData = await response.json();
          setTimelineItems(data.timeline);
        } else {
          throw new Error('Failed to load timeline data');
        }
      } catch (error) {
        console.error('Failed to load timeline:', error);
        setError('Failed to load timeline data');
        // Fallback data
        setTimelineItems([
          {
            id: '1',
            year: '2024 - Present',
            title: 'Senior Developer',
            company: 'Tech Company',
            location: 'Remote',
            description: 'Building amazing software solutions',
            highlights: ['Led development teams', 'Delivered multiple projects'],
            technologies: ['React', 'Node.js', 'TypeScript'],
            expanded: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setTimelineItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, expanded: !item.expanded }
          : item
      )
    );
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded(id);
    }
  }, [toggleExpanded]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  } as const;

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-dark-700 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error Loading Timeline
          </h1>
          <p className="text-gray-600 dark:text-dark-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gray-50 dark:bg-dark-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-100 mb-4">
            Professional Journey
          </h1>
          <p className="text-lg text-gray-600 dark:text-dark-400 max-w-2xl mx-auto">
            My career path and key milestones in software development. Click on any item to learn more.
          </p>
        </motion.div>

        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200 dark:bg-primary-800" 
               aria-hidden="true" />

          <div className="space-y-12">
            {timelineItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="relative pl-20"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-6 w-4 h-4 bg-primary-500 rounded-full border-4 border-white dark:border-dark-950"
                  aria-hidden="true"
                />

                {/* Card */}
                <motion.div
                  className={`bg-white dark:bg-dark-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer ${
                    item.expanded ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => toggleExpanded(item.id)}
                  onKeyDown={(e) => handleKeyPress(e, item.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={item.expanded}
                  aria-label={`${item.title} at ${item.company}. Click to ${item.expanded ? 'collapse' : 'expand'} details.`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-primary-600 dark:text-primary-400 font-medium">
                          {item.company} • {item.location}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <span className="text-sm font-medium text-gray-500 dark:text-dark-500 bg-gray-100 dark:bg-dark-800 px-3 py-1 rounded-full">
                          {item.year}
                        </span>
                        <svg
                          className={`ml-2 w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            item.expanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-dark-400 mb-4">
                      {item.description}
                    </p>

                    {/* Technology tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.technologies.slice(0, item.expanded ? undefined : 4).map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-3 py-1 text-xs font-medium bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {!item.expanded && item.technologies.length > 4 && (
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-400 rounded-full">
                          +{item.technologies.length - 4} more
                        </span>
                      )}
                    </div>

                    <AnimatePresence>
                      {item.expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-200 dark:border-dark-700 pt-4"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3">
                            Key Achievements
                          </h4>
                          <ul className="space-y-2" role="list">
                            {item.highlights.map((highlight, highlightIndex) => (
                              <motion.li
                                key={highlightIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: highlightIndex * 0.05 }}
                                className="flex items-start text-gray-600 dark:text-dark-400"
                              >
                                <svg
                                  className="w-4 h-4 text-primary-500 mt-1 mr-3 flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{highlight}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}