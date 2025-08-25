'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CaseStudy } from './CaseStudyCard';

export interface DetailedCaseStudy extends CaseStudy {
  content: string;
  technologies: string[];
  challenge?: string;
  solution?: string;
  results?: string;
  date?: string;
}

interface CaseStudyDetailProps {
  caseStudy: DetailedCaseStudy;
}

export default function CaseStudyDetail({ caseStudy }: CaseStudyDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen py-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <Link
            href="/case-studies"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 mb-8 transition-colors"
            aria-label="Back to case studies"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Case Studies
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-100 mb-4">
            {caseStudy.title}
          </h1>
          {caseStudy.date && (
            <p className="text-gray-600 dark:text-dark-400 text-lg mb-4">
              {caseStudy.date}
            </p>
          )}
          <p className="text-xl text-gray-700 dark:text-dark-300 mb-6">
            {caseStudy.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {caseStudy.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.header>

        {caseStudy.image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="mb-12 relative h-64 md:h-96"
          >
            <Image
              src={caseStudy.image}
              alt={caseStudy.title}
              fill
              className="object-cover rounded-lg shadow-lg"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.4 }}
          className="prose prose-lg dark:prose-dark max-w-none"
        >
          {caseStudy.challenge && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-100 mb-4">
                Challenge
              </h2>
              <p className="text-gray-700 dark:text-dark-300">
                {caseStudy.challenge}
              </p>
            </section>
          )}

          {caseStudy.solution && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-100 mb-4">
                Solution
              </h2>
              <p className="text-gray-700 dark:text-dark-300">
                {caseStudy.solution}
              </p>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-100 mb-4">
              Details
            </h2>
            <div
              className="text-gray-700 dark:text-dark-300"
              dangerouslySetInnerHTML={{ __html: caseStudy.content }}
            />
          </section>

          {caseStudy.results && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-100 mb-4">
                Results
              </h2>
              <p className="text-gray-700 dark:text-dark-300">
                {caseStudy.results}
              </p>
            </section>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}