import { NextResponse } from 'next/server'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://renovateplatform.com'
  const isProduction = process.env.NODE_ENV === 'production'
  
  const robots = `User-agent: *
${isProduction ? 'Allow: /' : 'Disallow: /'}

# Disallow sensitive paths
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /contractor/dashboard/
Disallow: /customer/dashboard/
Disallow: /auth/
Disallow: /settings/

# Allow public pages
Allow: /
Allow: /login
Allow: /register
Allow: /contractor-onboarding

# Crawl delay
Crawl-delay: 1

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml`

  return new NextResponse(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
