# Deployment Guide - Renovate Platform

This guide covers deploying the Renovate Platform to production using Vercel and setting up all necessary services.

## 🚀 **Quick Deployment Checklist**

### **Prerequisites**
- [ ] **GitHub Repository**: Code pushed to GitHub
- [ ] **Vercel Account**: Create account at [vercel.com](https://vercel.com)
- [ ] **Supabase Project**: Create project at [supabase.com](https://supabase.com)
- [ ] **Resend Account**: Create account at [resend.com](https://resend.com)
- [ ] **Domain (Optional)**: Custom domain for production

### **Environment Setup**
- [ ] Copy `env.example` to `.env.local`
- [ ] Configure all environment variables
- [ ] Test local development setup
- [ ] Verify database connectivity

### **Service Configuration**
- [ ] Set up Supabase database and authentication
- [ ] Configure Resend API for email notifications
- [ ] Set up Prisma database schema
- [ ] Generate Prisma client

### **Deployment**
- [ ] Connect Vercel to GitHub repository
- [ ] Configure environment variables in Vercel
- [ ] Deploy to production
- [ ] Verify deployment health
- [ ] Test core functionality

---

## 🔧 **Detailed Setup Instructions**

### **1. Environment Configuration**

**Copy the environment template:**
```bash
cp env.example .env.local
```

**Required Environment Variables:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (from Supabase)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Email Service
RESEND_API_KEY=re_your-api-key

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-random-string
```

### **2. Supabase Setup**

**Create Supabase Project:**
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Wait for database to be ready (~2 minutes)

**Get Configuration Values:**
1. Go to **Settings > API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

**Get Database URL:**
1. Go to **Settings > Database**
2. Copy **Connection string** (Direct connection)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Use as `DATABASE_URL`

**Set up Authentication:**
1. Go to **Authentication > Settings**
2. Configure **Site URL**: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### **3. Resend Email Setup**

**Create Resend Account:**
1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address

**Get API Key:**
1. Go to **API Keys**
2. Click **Create API Key**
3. Name it "Renovate Platform Production"
4. Copy the key → `RESEND_API_KEY`

**Domain Setup (Optional):**
1. Go to **Domains**
2. Add your domain
3. Configure DNS records as shown
4. Wait for verification

### **4. Database Setup**

**Initialize Database Schema:**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

**Verify Database:**
```bash
# Open Prisma Studio
npm run db:studio
```

### **5. Vercel Deployment**

**Connect Repository:**
1. Go to [vercel.com](https://vercel.com)
2. Click **Import Project**
3. Select your GitHub repository
4. Choose **Next.js** framework

**Configure Build Settings:**
- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave empty)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**Environment Variables in Vercel:**
1. Go to your project settings
2. Click **Environment Variables**
3. Add all variables from your `.env.local`
4. Set environment to **Production**

**Deploy:**
1. Click **Deploy**
2. Wait for build to complete (~3-5 minutes)
3. Test deployment URL

---

## 🔍 **Post-Deployment Verification**

### **Health Check**
Visit `https://your-domain.com/api/health` to verify:
- ✅ Application is running
- ✅ Database connection works
- ✅ Environment variables are set
- ✅ Services are accessible

### **Core Functionality Tests**
1. **Homepage**: Visit main site
2. **Registration**: Create new account
3. **Login**: Sign in with credentials
4. **Contractor Onboarding**: Complete profile setup
5. **Project Request**: Submit renovation request
6. **Email Notifications**: Check email delivery

### **Performance Monitoring**
- Check **Vercel Analytics** for performance metrics
- Monitor **Core Web Vitals** scores
- Verify **SEO** meta tags and Open Graph

---

## 🌐 **Custom Domain Setup**

### **Add Domain to Vercel**
1. Go to your project settings
2. Click **Domains**
3. Add your custom domain
4. Configure DNS records as shown

### **DNS Configuration**
**For Root Domain (example.com):**
```
Type: A
Name: @
Value: 76.76.19.61
```

**For Subdomain (www.example.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### **SSL Certificate**
- Vercel automatically provisions SSL certificates
- Certificate activation takes 5-10 minutes
- Verify HTTPS is working

---

## 🔒 **Security Configuration**

### **Environment Security**
- [ ] Use strong, unique passwords for all services
- [ ] Enable 2FA on Vercel, Supabase, and Resend accounts
- [ ] Rotate API keys regularly
- [ ] Never commit `.env.local` to version control

### **Application Security**
- [ ] Configure CORS headers (handled by `vercel.json`)
- [ ] Set up CSP headers for XSS protection
- [ ] Enable rate limiting on API routes
- [ ] Configure authentication redirects

### **Database Security**
- [ ] Use connection pooling
- [ ] Enable row-level security in Supabase
- [ ] Regular database backups
- [ ] Monitor for suspicious activity

---

## 📊 **Monitoring & Analytics**

### **Vercel Analytics**
1. Enable **Vercel Analytics** in project settings
2. Monitor page load times and performance
3. Track user interactions and conversions

### **Error Tracking**
```bash
# Add error tracking service (optional)
npm install @sentry/nextjs
```

### **Uptime Monitoring**
- Set up uptime monitoring for critical endpoints
- Monitor `/api/health` endpoint
- Set up alerts for downtime

---

## 🔄 **CI/CD Pipeline**

### **Automatic Deployments**
Vercel automatically deploys when you push to:
- **Main/Production**: `main` branch → Production
- **Preview**: Feature branches → Preview deployments

### **Build Optimization**
```json
// vercel.json optimizations included
{
  "buildCommand": "npm run build",
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

### **Database Migrations**
```bash
# For schema changes
npm run db:migrate

# Deploy migration
npm run db:push
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

**Build Failures:**
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies: `npm install`
- Check environment variables in Vercel

**Database Connection:**
- Verify DATABASE_URL format
- Check Supabase project status
- Test connection locally

**Email Not Sending:**
- Verify Resend API key
- Check domain verification
- Monitor Resend dashboard for errors

**Authentication Issues:**
- Check Supabase Auth settings
- Verify redirect URLs
- Check NEXT_PUBLIC_SUPABASE_URL

### **Debug Commands**
```bash
# Check environment variables
npm run dev

# Test database connection
npm run db:studio

# Check build locally
npm run build && npm start

# Type checking
npm run type-check
```

### **Log Analysis**
- **Vercel Logs**: Function logs in Vercel dashboard
- **Supabase Logs**: Database and Auth logs
- **Browser Console**: Client-side errors

---

## 📈 **Performance Optimization**

### **Build Optimization**
- Tree shaking enabled automatically
- Code splitting by routes
- Image optimization with Next.js
- Static generation where possible

### **Database Performance**
- Connection pooling via Supabase
- Indexed queries (defined in Prisma schema)
- Optimized API endpoints with proper caching

### **CDN & Caching**
- Vercel Edge Network for global distribution
- Static assets cached automatically
- API route caching where appropriate

---

## 🔄 **Backup & Recovery**

### **Database Backups**
- Supabase provides automatic backups
- Download manual backups from Supabase dashboard
- Set up scheduled backups for critical data

### **Code Backups**
- GitHub repository serves as code backup
- Tag releases for version control
- Keep deployment history in Vercel

### **Recovery Procedures**
1. **Database**: Restore from Supabase backup
2. **Application**: Rollback to previous Vercel deployment
3. **Configuration**: Restore environment variables

---

## 📞 **Support & Resources**

### **Documentation**
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Guides](https://supabase.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

### **Community Support**
- [Next.js Discord](https://nextjs.org/discord)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Supabase Discord](https://supabase.com/discord)

### **Emergency Contacts**
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Resend Support**: support@resend.com

---

## ✅ **Go-Live Checklist**

### **Final Pre-Launch**
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Backup procedures tested
- [ ] Monitoring systems active

### **Launch Day**
- [ ] Deploy to production
- [ ] Verify health endpoints
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check performance metrics

### **Post-Launch**
- [ ] Monitor for 24 hours
- [ ] Collect user feedback
- [ ] Address any issues
- [ ] Plan next iteration

**🎉 Your Renovate Platform is now live and ready to connect contractors with customers!**
