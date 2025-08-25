# Frontend Guideline Document

This document describes how the frontend of Ed’s portfolio site is built, styled, and maintained. It uses clear, everyday language so anyone can understand the setup.

## 1. Frontend Architecture

We use **Next.js** (v13 with the App Router) as the foundation. Next.js combines:

- **React** components 
- **TypeScript** for type safety
- **File-based routing** (every `.tsx` file in `app/` becomes a page)
- **API routes** under `app/api/` for serverless functions (e.g., the contact form)

This structure supports:
- **Scalability**: New pages or sections are added simply by creating new folders or files.
- **Maintainability**: TypeScript and React components keep code self-contained and well-typed.
- **Performance**: Next.js handles static site generation (SSG) and server-side rendering (SSR) out of the box.

## 2. Design Principles

Our guiding principles are:

1. **Usability**: Interfaces feel intuitive—navigation is in a consistent header, and loading spinners indicate progress.
2. **Accessibility**: We follow WCAG 2.1 AA standards: semantic HTML, keyboard-focusable elements, and ARIA labels where needed.
3. **Responsiveness**: The layout adapts from mobile to desktop using CSS flexbox and grid with mobile-first breakpoints.
4. **Clarity**: Each page has a clear purpose—home, projects, case studies, blog, contact; content is never cluttered.

These principles appear in practice as readable fonts, clear color contrasts, logical heading hierarchies, and visible focus states.

## 3. Styling and Theming

### Styling Approach
- We use **CSS Modules** for scoped, component-level styles. Each React component imports its own `*.module.css` file.
- Alternatively, **styled-components** can be used for dynamic styling inside JavaScript.

### Theming
- A set of CSS custom properties (variables) lives in a global stylesheet (`styles/globals.module.css`).
- These variables define the color palette, font stack, and spacing scale.
- Components reference the variables (`var(--primary-color)`) so theming stays consistent.

### Visual Style
- **Modern + Flat** with subtle **glassmorphism** touches on cards and modals (semi-transparent backgrounds, soft shadows).
- **Color Palette**:
  - Primary Blue: `#3366FF`  
  - Secondary Coral: `#FF6A3D`  
  - Background Light: `#F9FAFB`  
  - Surface White: `#FFFFFF`  
  - Text Dark: `#1A1A1A`  
  - Text Gray: `#555555`
- **Font**: "Inter", system-sans-serif fallback. It’s clean, highly legible, and widely supported.

## 4. Component Structure

We organize code into:

- `app/` – Contains pages and layouts according to Next.js App Router.
- `components/` – Reusable UI parts (buttons, cards, nav, loading spinners).
- `styles/` – Global styles, theme variables, and shared mixins.

Each component folder looks like:

```
components/Button/
  ├─ Button.tsx
  ├─ Button.module.css
  └─ Button.stories.tsx  (if using Storybook)
```

**Why component-based?**
- Encourages reusability and single responsibility.  
- Easier to test, document, and update without side effects.

## 5. State Management

- **Local State**: We rely on React’s `useState` and `useEffect` within components for form inputs, toggle states, and loading flags.
- **Global State**: For cross-cutting concerns (like theme toggles or user notifications), we use React’s **Context API**. This avoids prop drilling and keeps state logic centralized.
- **Data Fetching**: Next.js fetches page data at build time (SSG) or request time (SSR). Components receive data via props, so no third-party state library is needed for content.

## 6. Routing and Navigation

- **File-based routing**: Pages live under `app/`:
  - `app/page.tsx` → `/` (Home)
  - `app/projects/page.tsx` → `/projects`
  - `app/projects/[id]/page.tsx` → `/projects/:id`
  - Similarly for `case-studies` and `blog` sections.
- **Linking**: We use Next.js’s `<Link>` component for client-side navigation and prefetching.
- **Layouts**: Shared headers, footers, and sidebars are defined in `app/layout.tsx`, wrapping every page.

## 7. Performance Optimization

1. **SSG & SSR**: We pre-render most pages at build time for instant loads. Pages that need fresh data (like contact confirmations) use SSR.
2. **Image Optimization**: Use Next.js `<Image>` for automatic resizing, compression, and lazy loading.
3. **Code Splitting**: Next.js splits code by route. For heavy components, we use `dynamic()` imports to lazy-load them.
4. **Asset Minification**: CSS and JavaScript are minified during the build.
5. **Loading Indicators**: Section-specific `loading.tsx` files show feedback while data fetches, improving perceived speed.

## 8. Testing and Quality Assurance

- **Unit Tests**: Jest + React Testing Library. Write tests for components in `components/__tests__/`.
- **Integration Tests**: Test page-level interactions—navigation, form submissions—using Testing Library.
- **End-to-End (E2E) Tests**: Cypress or Playwright to simulate real user journeys (landing page → project detail → contact form).
- **Linting & Formatting**: ESLint with TypeScript rules plus Prettier to enforce code style and catch errors early.
- **Accessibility Checks**: Include `eslint-plugin-jsx-a11y` and run Lighthouse audits to meet accessibility goals.

## 9. Conclusion and Overall Frontend Summary

This frontend is built on **Next.js + React + TypeScript**, styled with **CSS Modules** (or styled-components), and hosted on **Vercel**. Its component-based structure, clear design principles, and robust performance optimizations deliver a fast, accessible, and maintainable portfolio. Dynamic routing, loading states, and serverless API routes ensure a seamless user experience—from browsing projects and blog posts to submitting the contact form—while keeping the codebase organized and scalable for future growth.