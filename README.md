# Edikan Udoibuot - Marketing & Growth Portfolio

*Professional portfolio showcasing 7+ years of marketing expertise and AI-driven growth strategies with comprehensive admin management system*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/edikanius-projects/portfolio-main)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Admin Portal](https://img.shields.io/badge/Admin-Portal-red?style=for-the-badge&logo=alert-circle&label=BROKEN)](https://github.com/edikaniu/eds-portfolio-updated)

## 🚨 CRITICAL STATUS ALERT

⚠️ **ADMIN AUTHENTICATION SYSTEM IS CURRENTLY BROKEN**  
⚠️ **ADMIN PORTAL IS INACCESSIBLE**  
⚠️ **AUTHENTICATION DEBUGGING IN PROGRESS**  

## 🚀 Overview

A modern, responsive portfolio website with **complete content management system** featuring an admin portal for dynamic content updates. Built with Next.js 15, TypeScript, Tailwind CSS, and Prisma ORM with PostgreSQL database.

**Live Site**: [https://portfolio-main-ten-xi.vercel.app](https://portfolio-main-ten-xi.vercel.app)  
**Admin Portal**: [https://portfolio-main-ten-xi.vercel.app/admin](https://portfolio-main-ten-xi.vercel.app/admin) ❌ **BROKEN**  

### 🔥 Current Issues
- **Admin login redirects to login page** (infinite loop)
- **JWT token cookies not being set properly** 
- **All admin functionality inaccessible**
- **Debug tools created but also non-functional**

📋 **Status Documentation**: See `ADMIN_AUTH_STATUS.md` for detailed issue analysis  
📋 **TODO List**: See `TODO.md` for pending fixes and enhancements

## ✨ Key Features

### 🎯 Frontend Portfolio
- **Dynamic Hero Section**: Database-driven content with typewriter animations
- **Skills & Expertise**: Fully manageable skill categories and proficiencies
- **Tools & Technology**: Complete tool management with logos and descriptions
- **Experience Timeline**: Professional career progression with metrics
- **Case Studies**: Detailed success stories with interactive metrics
- **Projects Showcase**: Filterable portfolio with CRUD operations
- **Blog System**: Full-featured blog with rich content management
- **AI Chatbot**: Intelligent assistant with customizable knowledge base

### 🔐 Admin Management Portal
- **Secure Authentication**: JWT-based admin login with bcrypt password hashing
- **Content Management**: Full CRUD operations for all frontend content
- **Media Management**: Image upload and management system
- **Blog Editor**: Rich text editor for blog posts with metadata
- **Analytics Dashboard**: Comprehensive stats and insights
- **User-Friendly UI**: Modern admin interface with real-time previews
- **Security Features**: Protected routes, input validation, and audit logging

### 🛠️ Technical Architecture
- **Database-Driven**: All content dynamically pulled from SQLite database
- **API-First Design**: RESTful APIs with comprehensive error handling
- **Real-Time Updates**: Changes in admin reflect immediately on frontend
- **Security Hardened**: OWASP security practices implemented
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Performance Optimized**: Caching, lazy loading, and optimized queries

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Library**: shadcn/ui + Radix UI primitives
- **Animations**: Framer Motion
- **State Management**: React hooks + Context API
- **Icons**: Lucide React

### Backend & Database
- **ORM**: Prisma with SQLite database
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcryptjs for secure passwords
- **Validation**: Zod schemas for all inputs
- **File Upload**: Next.js API routes with file handling
- **Middleware**: Custom admin authentication middleware

### Admin Portal
- **Dashboard**: React-based admin interface
- **Forms**: Dynamic form generation with validation
- **Rich Text Editor**: Advanced content editing capabilities
- **Image Management**: Upload and organize media files
- **Analytics**: Performance metrics and usage statistics
- **Security**: Role-based access control

### Security Features
- **Authentication**: JWT tokens with secure HTTP-only cookies
- **Authorization**: Protected admin routes and API endpoints
- **Input Validation**: Comprehensive Zod schema validation
- **SQL Injection Prevention**: Prisma ORM query protection
- **XSS Protection**: Content sanitization and secure headers
- **Rate Limiting**: API endpoint protection
- **Security Headers**: OWASP recommended security headers
- **Source Map Protection**: Disabled in production
- **Secret Management**: Environment variable validation

## 📁 Project Structure

```
portfolio-main/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin portal pages
│   │   ├── dashboard/            # Main admin dashboard
│   │   ├── blog/                 # Blog management
│   │   ├── projects/             # Project CRUD
│   │   ├── case-studies/         # Case studies management
│   │   ├── case-studies-stats/   # Impact metrics management
│   │   ├── skills/               # Skills management
│   │   ├── tools/                # Tools & technology management
│   │   ├── experience/           # Experience timeline management
│   │   ├── settings/             # Site configuration
│   │   └── login/                # Admin authentication
│   ├── api/                      # API routes
│   │   ├── admin/                # Protected admin endpoints
│   │   │   ├── auth/             # Authentication endpoints
│   │   │   ├── blog/             # Blog CRUD APIs
│   │   │   ├── projects/         # Projects CRUD APIs
│   │   │   ├── case-studies/     # Case studies CRUD APIs
│   │   │   ├── skills/           # Skills CRUD APIs
│   │   │   ├── tools/            # Tools CRUD APIs
│   │   │   └── experience/       # Experience CRUD APIs
│   │   ├── blog/                 # Public blog APIs
│   │   ├── case-studies/         # Public case studies APIs
│   │   ├── skills/               # Public skills APIs
│   │   ├── tools/                # Public tools APIs
│   │   └── experience/           # Public experience APIs
│   ├── blog/                     # Blog pages
│   ├── case-studies/             # Case study pages
│   ├── projects/                 # Project pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   │   ├── admin-layout.tsx      # Admin portal layout
│   │   └── dashboard-stats.tsx   # Analytics components
│   ├── ui/                       # Base UI components
│   │   ├── form-field.tsx        # Custom form components
│   │   ├── button.tsx            # Button variants
│   │   └── ...                   # Other UI primitives
│   ├── blog-section.tsx          # Blog display component
│   ├── case-studies-section.tsx  # Case studies with API integration
│   ├── skills-section.tsx        # Dynamic skills display
│   ├── tools-section.tsx         # Tools & technology section
│   ├── experience-section.tsx    # Professional timeline
│   ├── projects-section.tsx      # Projects showcase
│   └── embedded-chat.tsx         # AI chatbot
├── lib/                          # Utilities and configurations
│   ├── auth.ts                   # Authentication utilities
│   ├── admin-middleware.ts       # Admin route protection
│   ├── prisma.ts                 # Database connection
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Database schema
│   └── dev.db                    # SQLite database
├── scripts/                      # Database seeding scripts
│   ├── seed-skills.ts            # Seed skills data
│   ├── seed-tools.ts             # Seed tools data
│   ├── seed-experience.ts        # Seed experience data
│   └── seed-case-studies.ts      # Seed case studies data
├── public/                       # Static assets
│   ├── robots.txt                # SEO and security
│   └── ...                       # Images and icons
├── next.config.js                # Next.js configuration with security
├── ARCHITECTURE.md               # System architecture documentation
├── DEPLOYMENT.md                 # Deployment guidelines
├── DEVELOPMENT_GUIDE.md          # Development setup and guidelines
└── CLAUDE.md                     # AI assistant task management
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/portfolio-main.git
   cd portfolio-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx scripts/seed-skills.ts
   npx tsx scripts/seed-tools.ts
   npx tsx scripts/seed-experience.ts
   npx tsx scripts/seed-case-studies.ts
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)
   - Default admin: `admin@edikanudoibuot.com` / `admin123456`

## 🔐 Admin Portal Features

### Content Management
- **Dynamic Content**: All frontend content editable through admin interface
- **Real-Time Updates**: Changes reflect immediately on the frontend
- **Rich Text Editing**: Advanced editor for blog posts and descriptions
- **Media Management**: Upload and organize images with optimized delivery
- **SEO Management**: Meta tags, descriptions, and structured data

### Security Features
- **Secure Authentication**: JWT-based login with HTTP-only cookies
- **Protected Routes**: All admin endpoints require authentication
- **Input Validation**: Comprehensive validation using Zod schemas
- **Audit Logging**: Track all content changes and admin activities
- **Role-Based Access**: Admin-only access to management features

### Analytics & Monitoring
- **Dashboard Metrics**: Content statistics and usage analytics
- **Performance Monitoring**: Page views, load times, and user engagement
- **Content Insights**: Most popular content and user interactions
- **System Health**: Database status and application performance

## 📊 Current Portfolio Metrics

The portfolio showcases impressive results including:
- **200k+ Users Scaled** across growth campaigns
- **733% Email Subscriber Growth** in 3 months
- **$500k+ Marketing Budget** managed and optimized
- **5x ROAS** achieved through strategic campaigns
- **7+ Years** of marketing and growth experience
- **20+ Case Studies** with detailed metrics and outcomes
- **16+ Professional Tools** with expertise ratings

## 🔒 Security Implementation

### Authentication & Authorization
- ✅ JWT-based authentication with secure token management
- ✅ HTTP-only cookies for token storage
- ✅ Password hashing using bcryptjs (12 rounds)
- ✅ Admin route protection middleware
- ✅ Environment variable validation

### Input Validation & Sanitization
- ✅ Zod schemas for all API endpoints
- ✅ SQL injection prevention via Prisma ORM
- ✅ XSS protection with content sanitization
- ✅ File upload validation and security

### Security Headers & Configuration
- ✅ Production security headers (X-Frame-Options, CSP, etc.)
- ✅ Source maps disabled in production
- ✅ Admin routes hidden from search engines
- ✅ Rate limiting on API endpoints
- ✅ Secure ID generation using CUID

## 🚀 Deployment

### Production Requirements
1. **Environment Variables**:
   ```env
   DATABASE_URL="your-production-db-url"
   NEXTAUTH_SECRET="your-32-char-secret-key"
   ADMIN_EMAIL="your-admin-email"
   ADMIN_PASSWORD="your-secure-password"
   ```

2. **Database Setup**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Security Configuration**:
   - Update NEXTAUTH_SECRET with strong random key
   - Change default admin credentials
   - Configure proper CORS settings
   - Set up SSL/TLS certificates

### Vercel Deployment (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch
4. Admin portal accessible at `/admin`

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture and design patterns
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Deployment guidelines and requirements
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**: Development setup and coding standards
- **[CLAUDE.md](./CLAUDE.md)**: AI assistant task management and workflows

## 🛠️ Current Status

### ✅ Completed Features
- [x] Complete admin portal with authentication
- [x] Full CRUD operations for all content types
- [x] Database-driven frontend with API integration
- [x] Security audit and hardening
- [x] Performance optimization
- [x] Responsive design implementation
- [x] SEO and accessibility compliance

### 🔧 Known Issues
No critical issues. Application is production-ready with comprehensive security measures implemented.

## 🤝 Contributing

This is a personal portfolio project. For suggestions or issues:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for portfolio purposes. Please respect the personal content and branding.

## 📞 Contact

**Edikan Udoibuot**
- Email: edikanudoibuot@gmail.com
- LinkedIn: [linkedin.com/in/edikanudoibuot](https://linkedin.com/in/edikanudoibuot)
- X (Twitter): [@edikanudoibuot](https://x.com/edikanudoibuot)

---

**Built with ❤️ using Next.js 15, TypeScript, and modern web technologies**