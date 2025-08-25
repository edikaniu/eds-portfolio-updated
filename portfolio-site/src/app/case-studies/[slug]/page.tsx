import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CaseStudyDetail, { DetailedCaseStudy } from '../../../../components/CaseStudyDetail';

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

async function getCaseStudies(): Promise<DetailedCaseStudy[]> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'data', 'case-studies.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: { caseStudies: DetailedCaseStudy[] } = JSON.parse(fileContent);
    return data.caseStudies;
  } catch (error) {
    console.error('Failed to load case studies:', error);
    // Fallback data
    return [
      {
        slug: 'project-1',
        title: 'E-Commerce Platform Redesign',
        description: 'Complete redesign and development of a high-traffic e-commerce platform.',
        tags: ['React', 'Node.js', 'MongoDB'],
        technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'JWT', 'Tailwind CSS'],
        image: '/placeholder.jpg',
        date: '2024',
        challenge: 'The existing platform was outdated and slow.',
        solution: 'Built a modern, scalable solution.',
        results: 'Improved performance and user satisfaction.',
        content: 'Detailed project information...'
      },
    ];
  }
}

export async function generateStaticParams() {
  const caseStudies = await getCaseStudies();
  return caseStudies.map((caseStudy) => ({
    slug: caseStudy.slug,
  }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudies = await getCaseStudies();
  const caseStudy = caseStudies.find(cs => cs.slug === slug);
  
  if (!caseStudy) {
    return {
      title: 'Case Study Not Found - Edikan Udoibuot',
    };
  }

  return {
    title: `${caseStudy.title} - Edikan Udoibuot`,
    description: caseStudy.description,
    openGraph: {
      title: caseStudy.title,
      description: caseStudy.description,
      type: 'article',
      images: caseStudy.image ? [{ url: caseStudy.image }] : [],
    },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudies = await getCaseStudies();
  const caseStudy = caseStudies.find(cs => cs.slug === slug);

  if (!caseStudy) {
    notFound();
  }

  return <CaseStudyDetail caseStudy={caseStudy} />;
}