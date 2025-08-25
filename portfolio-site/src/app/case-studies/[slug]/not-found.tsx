import Link from 'next/link';

export default function CaseStudyNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-100 mb-4">
          Case Study Not Found
        </h1>
        <p className="text-xl text-gray-600 dark:text-dark-400 mb-8">
          The case study you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/case-studies"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to Case Studies
        </Link>
      </div>
    </div>
  );
}