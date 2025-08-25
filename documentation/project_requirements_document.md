# Project Requirements Document for Ed’s Personal Portfolio Website

## 1. Project Overview

Ed’s personal portfolio website is a modern, dynamic web application designed to showcase Ed’s professional work, in-depth case studies, and blog posts. Visitors can explore Ed’s projects on an index page, click through to dedicated detail views, read thought-leadership articles, and contact Ed directly via an integrated form. The site aims to present content clearly, load quickly, and provide a seamless browsing experience across devices.

The core problem this project solves is providing Ed with a single, maintainable platform to demonstrate expertise, share insights, and generate leads. By using file-system routing and dynamic content rendering, the site remains easy to update and scale. Success will be measured by quick page loads (<2 seconds), low bounce rates, and form submission engagement.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (First Version):**
• Project Showcase section with index and detail pages
• Case Study section with index and detail pages
• Blog section with index and detail pages
• Contact/Inquiry form with a serverless API endpoint (`/api/notify-question`)
• File-system–based routing for dynamic URLs (`[id]` pages)
• Loading state components at global and section levels
• Server-Side Rendering (SSR) or Static Site Generation (SSG) via Next.js
• Responsive design for mobile, tablet, and desktop

**Out-of-Scope (Later Phases):**
• Headless CMS integration (e.g., Sanity, Contentful)
• User authentication or login system
• Multi-language / internationalization support
• Advanced analytics dashboard
• E-commerce or payment integration
• Automated SEO sitemap generation (optional enhancement)

## 3. User Flow

A visitor lands on the homepage, sees a navigation bar (Home, Projects, Case Studies, Blog, Contact), and a hero section introducing Ed. They click “Projects” in the nav bar, which displays a grid or list of project cards. As content loads, a section-specific loading spinner appears briefly, then each card shows a project thumbnail, title, and short description. The user clicks a project card and is taken to a dynamic detail page (`/project/[id]`) where they read a full description, view images, and explore results.

After exploring projects, the visitor switches to “Blog” or “Case Studies” in the main menu. Each index operates similarly: a loading indicator, a list of items, and dynamic detail pages. Finally, the visitor clicks “Contact,” fills out the form (name, email, message), and submits. A client-side loader appears while the form POSTs to `/api/notify-question`. On success, the user sees a confirmation message. If an error occurs, an inline error message appears with guidance to retry.

## 4. Core Features

• **Home Page**: Hero section, brief introduction, calls to action
• **Projects Index & Detail**: Dynamic routing for `/project` and `/project/[id]`
• **Case Studies Index & Detail**: Dynamic routing for `/case-studies` and `/case-studies/[id]`
• **Blog Index & Detail**: Dynamic routing for `/blog` and `/blog/[id]`
• **Contact Form & API**: Frontend form, POST to `/api/notify-question/route.ts`, email or notification handling
• **Loading States**: Global and per-section loading components (`loading.tsx` files)
• **Responsive Layout**: Mobile-first design, flexible grid or flexbox layouts
• **SEO Metadata**: Dynamic `<head>` tags per page for titles, descriptions, and social previews

## 5. Tech Stack & Tools

**Frontend:**
- Next.js (React framework with file-system routing)
- TypeScript (`.tsx` files for type safety)
- CSS Modules or styled-components for scoped styles

**Backend/API:**
- Next.js API routes (serverless functions)
- Node.js (built-in to Next.js)

**Data Source (Assumed):**
- Markdown files or JSON for content (projects, case studies, blog)

**Hosting & Deployment:**
- Vercel (optimally for Next.js SSR/SSG)

**Development Tools:**
- VS Code with ESLint and Prettier plugins
- Git for version control

## 6. Non-Functional Requirements

• **Performance:** Page load under 2 seconds; use Next.js optimizations (image optimization, code splitting)
• **Security:** HTTPS by default; input validation and rate limiting on API; basic spam protection (e.g., honeypot or CAPTCHA)
• **Usability & Accessibility:** WCAG 2.1 AA compliance; keyboard navigation; ARIA attributes; responsive breakpoints
• **SEO Compliance:** Unique meta titles/descriptions; structured data for projects and articles
• **Reliability:** 99.9% uptime; proper error handling with user-friendly messages

## 7. Constraints & Assumptions

• The project uses Next.js v13+ with the App Router (file-based routing).
• No existing headless CMS—content lives in local files or a simple JSON store.
• Hosting on Vercel or a platform supporting Next.js serverless functions.
• No user authentication or data persistence beyond the contact form.
• Node.js runtime is available for API routes.

## 8. Known Issues & Potential Pitfalls

• **API Rate Limits:** If contact form is abused, implement rate limiting or CAPTCHA.
• **Large Media Files:** Unoptimized images can slow page loads—use `next/image`.
• **Dynamic Route 404s:** Missing `[id]` entries can lead to broken pages—add fallback handling.
• **SEO Duplication:** Duplicate meta tags if head components are not unique—ensure metadata is per-page.
• **Accessibility Oversights:** Without proper testing, interactive elements may not be keyboard-accessible—use linting tools (axe, Lighthouse).

By following this PRD, the AI model can generate subsequent technical documents (Tech Stack Details, Frontend Guidelines, Backend Structure, App Flow, File Structure, IDE Rules) without ambiguity or missing information.