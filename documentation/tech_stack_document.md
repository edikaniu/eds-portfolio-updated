# Tech Stack Document for Ed’s Portfolio Website

This document explains the technology choices behind Ed’s personal portfolio site in straightforward language. It covers the tools and services used to build, run, and secure the site, so everyone—technical or not—can understand why each piece matters.

## 1. Frontend Technologies

The frontend is everything a visitor sees and interacts with in their browser.

- **Next.js**
  • A popular framework built on React that handles page routing automatically based on file names.  
  • Supports both server-side rendering (SSR) and static site generation (SSG), which makes pages load quickly and helps with search engines.
- **React** (via Next.js)
  • Provides reusable building blocks (components) for the user interface, making the code easier to maintain and evolve.
- **TypeScript**
  • A superset of JavaScript that adds type checking.  
  • Catches errors early and makes the developer’s intent clearer, improving code quality.
- **CSS Modules** _or_ **styled-components**
  • CSS Modules keep styles scoped to individual components, avoiding naming collisions.  
  • styled-components let you write CSS directly in JavaScript files, making it easy to link styles with components.
- **next/image**
  • A built-in Next.js feature for optimizing images on the fly (resizing, lazy loading), improving performance and bandwidth usage.
- **Loading Components**
  • Custom `loading.tsx` files at both global and section levels provide quick visual feedback while data loads, giving a smoother experience.

These tools work together to create a fast, responsive, and maintainable user interface.

## 2. Backend Technologies

The backend powers data handling and server-side logic behind the scenes.

- **Next.js API Routes**
  • Serverless functions built into Next.js under the `/api` folder.  
  • For example, the `notify-question` route handles contact form submissions without needing a separate server.
- **Node.js**
  • The JavaScript runtime that runs your API routes and any server-side code you write.  
  • Comes bundled with Next.js, so no extra server setup is needed.
- **Data Source**
  • Content for projects, case studies, and blog posts lives in local Markdown files or JSON.  
  • This keeps the site simple and easy to update without a separate database.

Together, these components let you respond to form submissions, fetch content, and deliver pages quickly.

## 3. Infrastructure and Deployment

This section covers where the site runs and how updates get delivered.

- **Vercel**
  • A platform designed for Next.js apps that handles deployment, hosting, and serverless functions in one place.  
  • Automatic builds and previews on each code change streamline collaboration.
- **Git & GitHub**
  • Version control system (Git) with remote hosting (GitHub).  
  • Every change is tracked, making it easy to review, revert, or collaborate.
- **CI/CD Pipeline**
  • Vercel’s built-in pipeline automatically tests and deploys changes pushed to GitHub.  
  • Ensures that only working code reaches the live site, reducing downtime.

These choices deliver reliable, scalable hosting and make it simple to roll out new features.

## 4. Third-Party Integrations

While the core site runs on Next.js and local files, you can integrate additional services to enhance functionality:

- **Email Service (optional)**
  • Using an API route, you can plug in providers like SendGrid, Mailgun, or SMTP to send contact form messages.  
  • Outsourcing email delivery ensures reliable notifications and helps manage spam.
- **Analytics (optional)**
  • You might add Google Analytics or a privacy-focused tool like Plausible to track visitor behavior.  
  • Helps Ed understand which sections attract the most attention.

These integrations are flexible—add them as the portfolio grows.

## 5. Security and Performance Considerations

Keeping data safe and pages fast is a priority.

Security Measures:
- **HTTPS by Default**
  • All traffic is encrypted, protecting user input and form submissions.
- **Input Validation**
  • The contact form checks required fields and email format before submitting.  
  • Server-side checks prevent malicious or malformed data from being processed.
- **Rate Limiting / Spam Protection (recommended)**
  • Implement a simple honeypot field or Google reCAPTCHA to block automated abuse.

Performance Optimizations:
- **Static Site Generation (SSG)**
  • Pre-renders pages at build time where content doesn’t change on every request, ensuring near-instant loads.
- **Image Optimization**
  • The `next/image` component resizes and compresses images automatically.  
- **Code Splitting**
  • Next.js only loads the JavaScript needed for the current page, reducing download size.
- **Loading States**
  • Visual spinners keep users informed during longer data fetches, improving perceived speed.

Together, these practices keep the site secure, reliable, and snappy.

## 6. Conclusion and Overall Tech Stack Summary

This tech stack was chosen to create a clean, fast, and easy-to-maintain portfolio for Ed:

- **Next.js & React** for modern, component-based UI with built-in routing and data fetching.  
- **TypeScript** for safer, self-documenting code.  
- **CSS Modules/styled-components** for modular styling.  
- **Serverless API Routes** for handling contact forms without extra servers.  
- **Vercel + GitHub** for seamless deployment, hosting, and version control.  
- **Markdown/JSON content** for straightforward updates without a database.

By combining these technologies, the site loads quickly, is simple to update, and delivers a polished user experience—all while giving Ed full control over content and design.