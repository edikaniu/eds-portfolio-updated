# Vercel Database Setup Instructions

Your data migration is failing because the database isn't properly configured for Vercel deployment. Here's how to fix it:

## 🎯 Quick Fix (Recommended)

### Option 1: Use Vercel Postgres (Recommended)

1. **Go to your Vercel Dashboard**
   - Navigate to your project: `eds-portfolio-updated`
   - Go to the "Storage" tab
   - Click "Create Database"
   - Select "Postgres" 

2. **Configure Database**
   - Choose a name like `portfolio-db`
   - Select your region (closest to your users)
   - Click "Create"

3. **Copy Environment Variables**
   - After creation, Vercel will show you environment variables
   - Copy these to your project's Environment Variables section:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL` 
     - `POSTGRES_URL_NON_POOLING`
   - Also add: `DATABASE_URL` = `{POSTGRES_PRISMA_URL}`

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

### Option 2: Use External PostgreSQL

If you prefer using an external database (like Railway, Supabase, or PlanetScale):

1. **Create a PostgreSQL database** on your preferred platform
2. **Get the connection string** (format: `postgresql://user:pass@host:port/dbname`)
3. **Add to Vercel Environment Variables**:
   - `DATABASE_URL` = your PostgreSQL connection string
4. **Redeploy**

## 🔧 After Database Setup

Once you have the database configured:

1. **Access your admin portal** on the live site
2. **Navigate to "Data Migration"** in the admin sidebar  
3. **Click "Start Data Migration"**
4. **Wait for completion** - this will populate your database with all content

## ✅ What This Will Enable

After migration, you'll be able to:
- ✅ Edit all blog posts through admin portal
- ✅ Manage case studies with full content editing
- ✅ Update project information and descriptions  
- ✅ Modify skills categories and proficiency levels
- ✅ Customize tools and technology listings
- ✅ Full content management without code changes

## 🔍 Common Issues

**"Invalid DATABASE_URL" errors:**
- Make sure DATABASE_URL starts with `postgresql://`
- Check that all environment variables are saved in Vercel
- Redeploy after adding environment variables

**"Connection refused" errors:**
- Database server might not be accessible from Vercel
- Check database firewall settings
- Verify connection string format

**"Migration failed" errors:**
- Database might not have tables created yet
- The migration will create all necessary tables automatically
- Try running the migration again after a few minutes

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel function logs for detailed error messages
2. Verify all environment variables are set correctly
3. Make sure the database is accessible from external connections
4. Try the migration again - it's safe to run multiple times

The migration system will automatically:
- Create all necessary database tables
- Populate with your current content (18 blog posts, 14 case studies, etc.)
- Set up proper relationships and constraints
- Make everything editable through the admin portal