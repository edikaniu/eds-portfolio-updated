import { Metadata } from 'next';
import Hero from "../../components/Hero";
import MetricsHighlights from "../../components/MetricsHighlights";

export const metadata: Metadata = {
  title: "Home - Edikan Udoibuot | Software Engineer & Full-Stack Developer",
  description: "Welcome to Edikan Udoibuot's portfolio. Experienced Software Engineer with 5+ years building scalable web applications using React, Node.js, and modern technologies. View my work and professional journey.",
  keywords: [
    "edikan udoibuot",
    "software engineer portfolio",
    "full-stack developer",
    "react developer",
    "node.js developer",
    "web development projects",
    "professional software engineer",
    "javascript expert",
    "typescript developer"
  ],
  openGraph: {
    title: "Edikan Udoibuot - Software Engineer Portfolio",
    description: "Welcome to my portfolio showcasing 5+ years of software engineering experience and 50+ successful projects.",
    url: "https://edikan-udoibuot.vercel.app",
    images: [
      {
        url: "/og-image-home.jpg",
        width: 1200,
        height: 630,
        alt: "Edikan Udoibuot Software Engineer Portfolio Homepage",
      },
    ],
  },
  twitter: {
    title: "Edikan Udoibuot - Software Engineer Portfolio",
    description: "Welcome to my portfolio showcasing 5+ years of software engineering experience and 50+ successful projects.",
  },
  alternates: {
    canonical: "https://edikan-udoibuot.vercel.app",
  },
};

export default function Home() {
  const heroTitles = [
    "Software Engineer",
    "Full-Stack Developer",
    "Problem Solver",
    "Tech Enthusiast"
  ];

  return (
    <>
      <Hero titles={heroTitles} />
      <MetricsHighlights />
    </>
  );
}
