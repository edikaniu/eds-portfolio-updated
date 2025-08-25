import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "@/components/theme-provider"
import { StructuredData } from "@/components/structured-data"
import { PWAInstallPrompt } from "@/components/pwa-install"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { PerformanceReporter } from "@/components/performance-reporter"
import { CookieConsent } from "@/components/cookie-consent"
import { ErrorBoundary } from "@/components/error-boundary"
import { generatePersonSchema, generateWebsiteSchema, generateOrganizationSchema } from "@/lib/structured-data"
import { ClientErrorSetup } from "@/components/client-error-setup"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Edikan Udoibuot | Marketing & Growth Leader | AI-Powered Strategies",
  description:
    "Marketing professional with 7+ years scaling products from 100 to 10,000+ users. Specialized in AI-driven marketing, growth strategies, and product marketing.",
  keywords:
    "Growth Marketing Expert Nigeria, AI Marketing Strategist, Product Marketing Lead Fintech, Digital Marketing Specialist Lagos",
  authors: [{ name: "Edikan Udoibuot" }],
  creator: "Edikan Udoibuot",
  openGraph: {
    title: "Edikan Udoibuot | Marketing & Growth Leader",
    description: "Marketing professional with 7+ years scaling products from 100 to 10,000+ users.",
    url: "https://edikanudoibuot.com",
    siteName: "Edikan Udoibuot Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edikan Udoibuot | Marketing & Growth Leader",
    description: "Marketing professional with 7+ years scaling products from 100 to 10,000+ users.",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Generate global structured data
  const globalSchemas = [
    generatePersonSchema(),
    generateWebsiteSchema(),
    generateOrganizationSchema()
  ]

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <StructuredData data={globalSchemas} />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ClientErrorSetup />
            {children}
            <PWAInstallPrompt />
            <PerformanceMonitor />
            <PerformanceReporter />
            <CookieConsent />
            <Analytics />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
