'use client';

import { motion } from 'framer-motion';

export default function MetricsHighlights() {
  const highlights = [
    {
      title: "Clean Code Philosophy",
      description: "Writing maintainable, scalable code that stands the test of time.",
      icon: "💻"
    },
    {
      title: "User-Centered Design", 
      description: "Every line of code is written with the end user experience in mind.",
      icon: "🎨"
    },
    {
      title: "Performance First",
      description: "Optimized solutions that deliver exceptional speed and efficiency.",
      icon: "⚡"
    }
  ];

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
    <section className="py-20 bg-white dark:bg-dark-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 
            variants={itemVariants}
            transition={{ duration: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-100 mb-4"
          >
            Why Work With Me
          </motion.h2>
          <motion.p
            variants={itemVariants}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-dark-400 max-w-2xl mx-auto"
          >
            I combine technical expertise with creative problem-solving to deliver exceptional results.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {highlights.map((highlight, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="text-center p-8 rounded-xl bg-gray-50 dark:bg-dark-900 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="text-4xl mb-4">{highlight.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100 mb-4">
                {highlight.title}
              </h3>
              <p className="text-gray-600 dark:text-dark-400">
                {highlight.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}