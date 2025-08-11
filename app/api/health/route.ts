import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'DATABASE_URL',
      'RESEND_API_KEY'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    )
    
    const healthStatus: {
      status: string
      timestamp: string
      version: string
      environment: string
      database: string
      services: {
        supabase: boolean
        resend: boolean
        prisma: boolean
      }
      uptime: number
      memory: NodeJS.MemoryUsage
      region: string
      deployment: {
        vercel: boolean
        commit: string
        branch: string
      }
      warnings?: string[]
    } = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      services: {
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        resend: !!process.env.RESEND_API_KEY,
        prisma: true,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      region: process.env.VERCEL_REGION || 'local',
      deployment: {
        vercel: !!process.env.VERCEL,
        commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'local',
      }
    }
    
    if (missingEnvVars.length > 0) {
      healthStatus.status = 'warning'
      healthStatus.warnings = [`Missing environment variables: ${missingEnvVars.join(', ')}`]
    }
    
    return NextResponse.json(healthStatus, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: 'disconnected',
      services: {
        supabase: false,
        resend: false,
        prisma: false,
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
