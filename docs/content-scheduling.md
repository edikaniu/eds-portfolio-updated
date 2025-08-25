# Content Scheduling System

The content scheduling system allows you to create blog posts that are automatically published at scheduled times.

## Features

### 🕐 Scheduled Publishing
- Schedule posts to publish at specific dates and times
- Automatic publication via cron jobs (every 5 minutes)
- Manual publishing override option

### 📝 Content Management
- Full rich-text editor support
- Draft management with auto-cleanup
- Version control integration
- Metadata and tagging support

### 🎯 Scheduling Options
- **Auto-publish**: Posts publish automatically when scheduled
- **Notifications**: Optional email notifications when posts go live
- **Social sharing**: Prepare posts for social media integration

### 📊 Analytics & Monitoring
- Track scheduled vs published posts
- View publication queue and timing
- Monitor auto-publication success rates

## Usage

### Creating Scheduled Posts

1. Navigate to **Admin > Content > Scheduler**
2. Click "Schedule New Post"
3. Fill in post details:
   - Title and content (required)
   - Author, tags, excerpt (optional)
   - Featured image URL
4. Select publish date and time
5. Configure scheduling options:
   - Auto-publish (default: enabled)
   - Notifications (default: disabled)
   - Social media sharing (future feature)

### Managing Scheduled Posts

- **View Queue**: See all upcoming publications with countdown timers
- **Edit Posts**: Modify content or reschedule publication
- **Publish Early**: Override schedule to publish immediately
- **Cancel Posts**: Remove scheduled posts before publication

### Automatic Publishing

The system runs a cron job every 5 minutes to:
- Check for posts ready to publish
- Update post status from draft to published
- Log publication events
- Clean up expired drafts (older than 30 days)

## API Endpoints

### Content Scheduling
- `GET /api/admin/content/schedule` - List scheduled posts
- `POST /api/admin/content/schedule` - Create scheduled post
- `PUT /api/admin/content/schedule` - Update/cancel/publish post

### Auto-Publishing
- `GET /api/admin/content/publish` - Get publication analytics
- `POST /api/admin/content/publish` - Trigger manual publication run

### Cron Jobs
- `GET /api/cron/publish-posts` - Auto-publication endpoint (Vercel cron)

## Configuration

### Environment Variables
```env
# Optional: Secure cron jobs with a secret
CRON_SECRET=your-secret-key

# Email notifications (if enabled)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

### Vercel Deployment
The system includes Vercel cron job configuration in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-posts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

## Database Schema

### BlogPost Model
```prisma
model BlogPost {
  id              String    @id @default(cuid())
  title           String
  slug            String    @unique
  content         String
  excerpt         String?
  imageUrl        String?
  author          String?
  published       Boolean   @default(false)
  publishedAt     DateTime?
  metadata        String?   // JSON: scheduling options
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### Metadata Structure
```json
{
  "scheduled": true,
  "autoPublish": true,
  "notifyOnPublish": false,
  "socialMediaShare": false,
  "scheduledAt": "2024-01-15T10:00:00Z",
  "actualPublishedAt": "2024-01-15T10:02:30Z",
  "autoPublished": true
}
```

## Manual Scripts

### Publish Scheduled Posts
```bash
npx tsx scripts/publish-scheduled-posts.ts
```

### Clean Up Old Drafts
```bash
# Included in the publish script
# Removes drafts older than 30 days
```

## Security Features

- Admin authentication required for all operations
- CSRF token validation
- Rate limiting on API endpoints
- Optional cron job secret verification
- Input sanitization and validation

## Monitoring

The system provides comprehensive logging:
- Publication events and timing
- Failed publication attempts with error details
- Draft cleanup operations
- User actions (create, update, cancel posts)

All events are logged through the centralized logging system for monitoring and debugging.

## Future Enhancements

- Social media auto-posting integration
- Email newsletter automation
- Content approval workflows
- Advanced scheduling patterns (recurring posts)
- A/B testing for scheduled content
- Performance analytics integration