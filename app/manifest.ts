import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Edikan Udoibuot - Marketing & Growth Portfolio',
    short_name: 'Edikan Portfolio',
    description: 'Marketing professional with 7+ years scaling products through data-driven growth strategies and AI-powered marketing.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    categories: ['business', 'education', 'productivity'],
    lang: 'en-US',
    dir: 'ltr',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Portfolio Homepage - Desktop View'
      },
      {
        src: '/screenshots/mobile-home.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Portfolio Homepage - Mobile View'
      },
      {
        src: '/screenshots/projects.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Projects Gallery'
      },
      {
        src: '/screenshots/blog.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Blog Posts'
      }
    ],
    shortcuts: [
      {
        name: 'View Projects',
        short_name: 'Projects',
        description: 'Browse marketing projects and case studies',
        url: '/projects',
        icons: [
          {
            src: '/icons/projects-96x96.png',
            sizes: '96x96'
          }
        ]
      },
      {
        name: 'Read Blog',
        short_name: 'Blog',
        description: 'Read latest marketing insights',
        url: '/blog',
        icons: [
          {
            src: '/icons/blog-96x96.png',
            sizes: '96x96'
          }
        ]
      },
      {
        name: 'Contact',
        short_name: 'Contact',
        description: 'Get in touch for collaborations',
        url: '/#contact',
        icons: [
          {
            src: '/icons/contact-96x96.png',
            sizes: '96x96'
          }
        ]
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  }
}