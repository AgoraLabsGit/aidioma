# Troubleshooting Guide

## Common Issues

### Database Connection Problems
- Check DATABASE_URL environment variable
- Verify database accessibility (SQLite file permissions locally, PostgreSQL connection in production)
- Review connection pool settings
- Test database connectivity
- **Local**: Ensure `database.db` file exists and is writable
- **Production**: Verify PostgreSQL server is running and accessible

### Authentication Issues
- Verify authentication configuration for current environment
- Check SESSION_SECRET setting
- Review authentication flow implementation
- Test login/authentication process
- **Local**: Ensure auth stubbing is working correctly
- **Production**: Verify production auth system is configured

### AI Service Problems
- Validate OpenAI API key
- Check API rate limits
- Review request/response formats
- Monitor API usage
- Test caching system performance

### Frontend Issues
- Check browser console for errors
- Verify API endpoint connectivity
- Review component error boundaries
- Test responsive design
- Check local development server on http://localhost:5001

## Debugging Tools
- Browser developer tools
- Terminal/console logs (local development)
- Database query logs
- Network request monitoring
- TypeScript compiler output (`npx tsc --noEmit --skipLibCheck`)

## Performance Issues
- Monitor response times
- Check database query performance
- Review bundle sizes
- Optimize image loading
- Check AI API response times and caching effectiveness

## Local Development Issues

### Development Server Won't Start
```bash
# Check if port 5001 is in use
lsof -i :5001

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
# Reset local database
rm database.db
npx drizzle-kit migrate

# Check database file permissions
ls -la database.db
```

### TypeScript Errors
```bash
# Run type checking
npx tsc --noEmit --skipLibCheck

# Clear TypeScript cache
rm -rf .tsbuildinfo
```

## Production Issues

### Application Not Starting
- Check Node.js version compatibility
- Verify all environment variables are set
- Review production build process
- Check server logs for startup errors

### Database Migration Problems
- Backup production database before migrations
- Test migrations on staging environment first
- Check database user permissions
- Review migration files for syntax errors

## Quick Fixes

### Environment Variables
```bash
# Local development .env example
DATABASE_URL=./database.db
OPENAI_API_KEY=sk-your-key-here
SESSION_SECRET=local-development-secret
NODE_ENV=development
```

### Common Error Solutions
- **"Module not found"**: Run `npm install`
- **"Database locked"**: Restart development server
- **"OpenAI API error"**: Check API key and rate limits
- **"Port already in use"**: Change port or kill existing process