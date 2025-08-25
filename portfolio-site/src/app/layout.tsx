import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import Layout from "../../components/Layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Edikan Udoibuot - Software Engineer & Full-Stack Developer",
  description: "Experienced Software Engineer specializing in full-stack web development with React, Node.js, and modern technologies. View my portfolio showcasing 50+ projects and 5+ years of professional experience.",
  keywords: [
    "software engineer",
    "full-stack developer",
    "web development",
    "react developer",
    "node.js developer",
    "portfolio",
    "frontend developer",
    "backend developer",
    "javascript developer",
    "typescript developer",
    "next.js",
    "tailwind css",
    "mongodb",
    "postgresql",
    "aws",
    "cloud computing"
  ],
  authors: [{ name: "Edikan Udoibuot" }],
  creator: "Edikan Udoibuot",
  publisher: "Edikan Udoibuot",
  metadataBase: new URL('https://edikan-udoibuot.vercel.app'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://edikan-udoibuot.vercel.app",
    title: "Edikan Udoibuot - Software Engineer & Full-Stack Developer",
    description: "Experienced Software Engineer specializing in full-stack web development. View my portfolio showcasing 50+ projects and 5+ years of professional experience.",
    siteName: "Edikan Udoibuot Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Edikan Udoibuot - Software Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Edikan Udoibuot - Software Engineer & Full-Stack Developer",
    description: "Experienced Software Engineer specializing in full-stack web development. View my portfolio showcasing 50+ projects and professional experience.",
    creator: "@edikaniudoibuot",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://edikan-udoibuot.vercel.app",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Edikan Udoibuot",
    "url": "https://edikan-udoibuot.vercel.app",
    "sameAs": [
      "https://github.com/edikaniu",
      "https://linkedin.com/in/edikan-udoibuot",
      "https://twitter.com/edikaniudoibuot"
    ],
    "jobTitle": "Software Engineer",
    "worksFor": {
      "@type": "Organization",
      "name": "Tech Innovation Hub"
    },
    "description": "Experienced Software Engineer specializing in full-stack web development with React, Node.js, and modern technologies.",
    "knowsAbout": [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "Web Development",
      "Full Stack Development",
      "Software Engineering"
    ]
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body
        className={`${inter.variable} ${firaCode.variable} font-sans antialiased`}
      >
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
