import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
// 방금 만든 Providers 컴포넌트를 import 합니다.
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '리노베이트 플랫폼',
  description: '전문적인 리노베이션 서비스를 위한 플랫폼',
  keywords: '리노베이션, 인테리어, 건설, 업체',
  authors: [{ name: 'Renovate Platform' }],
  creator: 'Renovate Platform',
  publisher: 'Renovate Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://renovate-platform.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '리노베이트 플랫폼',
    description: '전문적인 리노베이션 서비스를 위한 플랫폼',
    url: 'https://renovate-platform.com',
    siteName: '리노베이트 플랫폼',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '리노베이트 플랫폼',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '리노베이트 플랫폼',
    description: '전문적인 리노베이션 서비스를 위한 플랫폼',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-white`}>
        {/*
          QueryClientProvider 대신 새로 만든 Providers 컴포넌트로 감싸줍니다.
          이렇게 하면 QueryClient 인스턴스 생성과 Provider 사용이 모두
          "use client" 경계 안에서 안전하게 처리됩니다.
        */}
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}