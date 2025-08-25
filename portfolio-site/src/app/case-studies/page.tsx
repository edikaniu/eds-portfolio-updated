import { Metadata } from 'next';
import CaseStudyCard, { CaseStudy } from '../../../components/CaseStudyCard';

export const metadata: Metadata = {
  title: 'Case Studies - Edikan Udoibuot | Software Engineering Projects & Solutions',
  description: 'Explore detailed case studies of my software engineering projects. From e-commerce platforms to real-time collaboration apps, discover the challenges solved, technologies used, and results achieved in each project.',
  keywords: [
    'software engineering case studies',
    'project portfolio',
    'web development projects',
    'react projects',
    'node.js applications',
    'full-stack development',
    'technical solutions',
    'programming projects',
    'edikan udoibuot projects'
  ],
  openGraph: {
    title: 'Case Studies - Software Engineering Projects by Edikan Udoibuot',
    description: 'Detailed case studies showcasing software engineering expertise across various technologies and domains.',
    url: 'https://edikan-udoibuot.vercel.app/case-studies',
    images: [
      {
        url: "/og-image-case-studies.jpg",
        width: 1200,
        height: 630,
        alt: "Edikan Udoibuot Software Engineering Case Studies and Projects",
      },
    ],
  },
  twitter: {
    title: 'Case Studies - Software Engineering Projects',
    description: 'Detailed case studies showcasing software engineering expertise and project solutions.',
  },
  alternates: {
    canonical: 'https://edikan-udoibuot.vercel.app/case-studies',
  },
};

interface CaseStudiesData {
  caseStudies: CaseStudy[];
}

async function getCaseStudies(): Promise<CaseStudy[]> {
  try {
    // In a static export, we need to read from the public directory
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'data', 'case-studies.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: CaseStudiesData = JSON.parse(fileContent);
    return data.caseStudies;
  } catch (error) {
    console.error('Failed to load case studies:', error);
    // Fallback data
    return [
      {
        slug: 'project-1',
        title: 'E-Commerce Platform Redesign',
        description: 'Complete redesign and development of a high-traffic e-commerce platform serving over 100,000 monthly users.',
        tags: ['React', 'Node.js', 'MongoDB'],
        image: '/placeholder.jpg'
      },
      {
        slug: 'project-2',
        title: 'Real-Time Collaboration App',
        description: 'A comprehensive real-time collaboration platform for remote teams with video calling and project management.',
        tags: ['React Native', 'Firebase', 'Socket.io'],
        image: '/placeholder.jpg'
      },
    ];
  }
}

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();

  return (
    <div className="min-h-screen py-16 bg-white dark:bg-dark-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-100 mb-4">
            Case Studies
          </h1>
          <p className="text-xl text-gray-600 dark:text-dark-400 max-w-2xl mx-auto">
            Detailed insights into projects, challenges solved, and solutions implemented.
            Each project demonstrates different aspects of full-stack development.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {caseStudies.map((caseStudy, index) => (
            <div
              key={caseStudy.slug}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CaseStudyCard caseStudy={caseStudy} />
            </div>
          ))}
        </div>

        {caseStudies.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-dark-100 mb-4">
              No Case Studies Available
            </h3>
            <p className="text-gray-600 dark:text-dark-400">
              Case studies are currently being prepared. Please check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}