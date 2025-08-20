import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://renovateplatform.com'

export const metadata: Metadata = {
  title: {
    default: 'Renovate Platform - Connect with Trusted Contractors in the GTA',
    template: '%s | Renovate Platform'
  },
  description: 'Find verified contractors for your home renovation projects in the Greater Toronto Area. Get competitive bids, compare proposals, and hire with confidence.',
  keywords: [
    'home renovation',
    'contractors',
    'GTA contractors',
    'Toronto renovation',
    'kitchen renovation',
    'bathroom renovation',
    'basement finishing',
    'home improvement',
    'contractor bids',
    'verified contractors'
  ],
  authors: [{ name: 'Renovate Platform Team' }],
  creator: 'Renovate Platform',
  publisher: 'Renovate Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: siteUrl,
    siteName: 'Renovate Platform',
    title: 'Renovate Platform - Connect with Trusted Contractors in the GTA',
    description: 'Find verified contractors for your home renovation projects in the Greater Toronto Area. Get competitive bids, compare proposals, and hire with confidence.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Renovate Platform - Trusted Home Renovation Contractors',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Renovate Platform - Connect with Trusted Contractors',
    description: 'Find verified contractors for your home renovation projects in the GTA.',
    images: [`${siteUrl}/twitter-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Home Improvement',
  manifest: `${siteUrl}/manifest.json`,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2563eb',
}

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Renovate Platform" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-white`}>
        <QueryClientProvider client={queryClient}>
          <Header />
          <main className="min-h-screen">
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </main>
        </QueryClientProvider>
      </body>
    </html>
  )
}