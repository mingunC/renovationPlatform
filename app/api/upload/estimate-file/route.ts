import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'No project ID provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('File upload attempt:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      projectId: projectId
    })

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File size exceeds 10MB limit' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 파일 타입 검증
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 업로드 디렉토리 생성
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'estimates')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
      console.log('Created upload directory:', uploadDir)
    }

    // 파일명 생성 (프로젝트ID_타임스탬프_원본파일명)
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${projectId}_${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // 파일을 ArrayBuffer로 변환
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 파일 저장
    await writeFile(filePath, buffer)
    console.log('File saved successfully:', filePath)

    // 파일 URL 생성
    const fileUrl = `/uploads/estimates/${fileName}`

    return new Response(JSON.stringify({
      success: true,
      fileUrl: fileUrl,
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('File upload error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
