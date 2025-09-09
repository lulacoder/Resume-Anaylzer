# Deployment Guide

This guide covers deploying the Resume Analyzer application to production.

## Prerequisites

- Node.js 20+ installed
- Supabase project configured
- Google Gemini API key
- Domain name (optional but recommended)

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Deployment Options

### 1. Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from command line
vercel --prod
```

### 2. Docker Deployment

```bash
# Build the Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:compose

# Or run directly
docker run -p 3000:3000 --env-file .env.local resume-analyzer
```

### 3. Traditional VPS/Server

```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start the production server
npm start
```

## Pre-deployment Checklist

- [ ] Run `npm run lint` to check for code issues
- [ ] Run `npm run type-check` to verify TypeScript
- [ ] Run `npm test` to ensure all tests pass
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Configure Supabase RLS policies for production
- [ ] Set up proper database backups
- [ ] Configure monitoring and error tracking
- [ ] Test file upload functionality
- [ ] Verify AI analysis is working correctly

## Performance Optimizations

The application includes several production optimizations:

- **Bundle splitting**: Vendor, common, PDF.js, and charts are split into separate chunks
- **Image optimization**: WebP/AVIF formats with proper caching
- **Security headers**: XSS protection, frame options, content type sniffing prevention
- **Compression**: Gzip compression enabled
- **Caching**: Static assets cached for 1 year

## Monitoring

### Health Check Endpoint

The application includes a health check endpoint at `/api/health`:

```bash
curl https://your-domain.com/api/health
```

### Key Metrics to Monitor

- Response times for analysis endpoints
- PDF upload success rates
- Database query performance
- Error rates and types
- User authentication flows

## Security Considerations

- Environment variables are properly secured
- Security headers are configured
- File uploads are validated and size-limited
- Database queries use parameterized statements
- Authentication is handled by Supabase

## Troubleshooting

### Common Issues

1. **Build failures**: Check TypeScript errors and ESLint warnings
2. **Environment variables**: Ensure all required variables are set
3. **Database connection**: Verify Supabase configuration
4. **File uploads**: Check server action body size limits
5. **AI analysis**: Verify Gemini API key and quotas

### Logs

- Check application logs for errors
- Monitor Supabase logs for database issues
- Use Vercel/platform-specific logging tools

## Scaling Considerations

- **Database**: Monitor connection pool usage
- **File storage**: Consider CDN for uploaded files
- **AI API**: Monitor Gemini API usage and rate limits
- **Caching**: Implement Redis for session storage if needed
- **Load balancing**: Use multiple instances behind a load balancer

## Backup Strategy

- **Database**: Regular Supabase backups
- **Files**: Backup uploaded resumes from storage bucket
- **Code**: Git repository with proper branching strategy
- **Environment**: Document all configuration and secrets