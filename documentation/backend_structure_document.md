# Backend Structure Document for Ed’s Portfolio Website

## 1. Backend Architecture

Our backend is built into the Next.js framework, using its serverless API routes to handle dynamic functionality without a separate server process. Here’s how it’s structured and why it works well:

• File-based API Routes – Each folder under `/api` becomes its own serverless function, so there’s no need to manually configure servers or endpoints.  
• Serverless Functions – Node.js functions spin up on demand, handling requests (like contact form submissions) and then spin down, saving resources.  
• Design Patterns – We follow a simple “handler” pattern: an HTTP request comes in, is validated, processed (e.g., send an email), and then a response is returned.  
• Scalability – Because the functions run on a serverless platform (Vercel), they can scale automatically with traffic, handling spikes without manual provisioning.  
• Maintainability – Logic is organized per route under `/api`, so adding or updating functionality is as easy as editing or adding a file.  
• Performance – Cold starts are minimized by Vercel’s edge network; static content is served instantly, and API routes only run when needed.

## 2. Database Management

Rather than a traditional database, we store most content in local files or simple JSON structures. This keeps things lightweight and easy to update:

• Content Files – Projects, case studies, and blog posts live as Markdown or JSON files in the repository.  
• NoSQL-style Structure – Each content file includes a unique identifier and metadata (title, date, excerpt) plus the main content body.  
• Read-only Data – Static content is loaded at build time or on request, ensuring fast delivery without a running database server.  
• Contact Inquiries – Form submissions are sent via email (using a service like SendGrid). We do not persist them in a database, but we could easily plug in a database later if storage is needed.

## 3. Database Schema

Since we’re using file-based content, here’s how each type of content is organized in plain English:

Projects:
- Each project is a file named with a unique ID.  
- Fields: “id” (string), “title” (string), “description” (string), “images” (list of URLs), “technologies” (list of strings), “outcome” (string).

Case Studies:
- Each case study is a file named with a unique ID.  
- Fields: “id” (string), “title” (string), “challenge” (string), “approach” (string), “results” (string), “images” (list of URLs).

Blog Posts:
- Each blog post is a file named with a unique ID.  
- Fields: “id” (string), “title” (string), “date” (ISO date string), “excerpt” (string), “content” (string/Markdown).

Contact Inquiries (optional database):
If we added storage, inquiries might live in a NoSQL collection (e.g., Firestore or MongoDB) with fields: “id”, “name”, “email”, “message”, “submittedAt”.

## 4. API Design and Endpoints

We use RESTful patterns in Next.js API routes:

• POST `/api/notify-question`  
  – Purpose: Receive contact form submissions from visitors.  
  – Workflow:  
    • Validate incoming fields (name, email, message).  
    • (Optionally) Verify spam tokens or honeypots.  
    • Send an email notification via a third-party service.  
    • Return a JSON response with success or error status.

Future endpoints (if needed):
• GET `/api/projects`  – List all projects.  
• GET `/api/projects/[id]`  – Get details for one project.  
• Similar routes for case studies and blog posts, if we move from file-system routing to a true API.

## 5. Hosting Solutions

We host everything on Vercel, which is designed to pair with Next.js:

• Serverless Platform – API routes deploy as individual functions.  
• Global CDN – Static assets and pre-rendered pages are cached at edge locations, delivering content fast anywhere in the world.  
• Auto Scaling – Functions scale automatically with demand, so no manual server management.  
• Preview Deployments – Each GitHub pull request gets its own URL, making reviews and tests easier.  
• Cost-effectiveness – You pay for what you use; serverless functions incur runtime costs only when they run.

## 6. Infrastructure Components

Even though much is abstracted by Vercel, here’s what underpins our setup:

• CDN (Content Delivery Network) – Delivers static pages and images from the network edge.  
• Load Balancing – Vercel automatically routes traffic to the nearest edge server and balances load among functions.  
• Caching Mechanisms – Static content is cached by default; dynamic API responses can be cached with headers if desired.  
• Image Optimization – The Next.js `next/image` component integrates with the CDN to resize and serve optimized images on the fly.  
• Edge Logging – Vercel collects logs for both successful requests and errors, which we can inspect in the dashboard.

## 7. Security Measures

We’ve implemented several layers of protection to keep data safe and comply with best practices:

• HTTPS Everywhere – All traffic is encrypted by default, ensuring no data is exposed in transit.  
• Input Validation – API routes check required fields and enforce email patterns to prevent injection attacks.  
• Spam Protection – We recommend adding a simple honeypot field or Google reCAPTCHA on the contact form.  
• Environment Variables – Secrets (like email service API keys) are stored in Vercel’s encrypted environment settings, never in code.  
• Rate Limiting (optional) – Can be configured at the edge or inside serverless functions to block abuse.  
• CORS Policy – API routes can be locked down to accept requests only from the portfolio’s domain.

## 8. Monitoring and Maintenance

Keeping the backend healthy involves these tools and practices:

• Vercel Dashboard – Tracks deployments, usage metrics, function execution times, and error rates.  
• Log Streaming – Real-time logs for API functions show incoming requests and stack traces for errors.  
• Alerts – Set up email or Slack alerts for failed deployments or spikes in error rates.  
• Scheduled Checks – Add a simple uptime monitor (e.g., Pingdom) to ensure the site returns a 200 OK on the homepage.  
• Dependency Updates – Regularly update Next.js, Node.js, and npm packages to get security patches and performance improvements.  
• Backup Strategy – Content files are versioned in GitHub, so any mistake can be reverted instantly.

## 9. Conclusion and Overall Backend Summary

In summary, Ed’s portfolio backend is a lightweight, serverless setup powered by Next.js and Vercel. It uses file-based content for simplicity, serverless API routes for interactive features, and Vercel’s edge network for fast, reliable delivery. Security is enforced through HTTPS, input validation, and environment-based secrets. Monitoring comes built in via Vercel, with options for additional uptime checks and alerts. This architecture aligns perfectly with the project’s goals: minimal overhead, easy updates, and a seamless visitor experience without sacrificing performance or security.