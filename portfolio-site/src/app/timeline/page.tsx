import { Metadata } from 'next';
import Timeline from '../../../components/Timeline';

export const metadata: Metadata = {
  title: 'Professional Timeline - Edikan Udoibuot | Career Journey & Experience',
  description: 'Explore my professional journey as a Software Engineer. From university education to senior developer roles, discover my career milestones, key achievements, and technology expertise gained over 5+ years.',
  keywords: [
    'professional timeline',
    'career journey',
    'software engineer experience',
    'edikan udoibuot career',
    'developer career path',
    'programming experience',
    'professional milestones',
    'tech career progression'
  ],
  openGraph: {
    title: 'Professional Timeline - Edikan Udoibuot',
    description: 'Explore my professional journey and career milestones as a Software Engineer with 5+ years of experience.',
    url: 'https://edikan-udoibuot.vercel.app/timeline',
    images: [
      {
        url: "/og-image-timeline.jpg",
        width: 1200,
        height: 630,
        alt: "Edikan Udoibuot Professional Timeline and Career Journey",
      },
    ],
  },
  twitter: {
    title: 'Professional Timeline - Edikan Udoibuot',
    description: 'Explore my professional journey and career milestones as a Software Engineer.',
  },
  alternates: {
    canonical: 'https://edikan-udoibuot.vercel.app/timeline',
  },
};

export default function TimelinePage() {
  return <Timeline />;
}