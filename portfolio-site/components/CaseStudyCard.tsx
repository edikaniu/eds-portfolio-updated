'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export default function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-dark-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <Link href={`/case-studies/${caseStudy.slug}`} className="block">
        {caseStudy.image && (
          <div className="h-48 bg-gray-200 dark:bg-dark-800 relative">
            <Image
              src={caseStudy.image}
              alt={caseStudy.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-dark-100">
            {caseStudy.title}
          </h3>
          <p className="text-gray-600 dark:text-dark-400 mb-4 line-clamp-3">
            {caseStudy.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {caseStudy.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}