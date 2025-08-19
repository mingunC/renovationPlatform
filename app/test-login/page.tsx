'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function TestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // 환경 변수 확인
      console.log('환경 변수:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '없음'
      })
      
      // 로그인 테스트
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123456'
      })
      
      setResult({ data, error })
      console.log('로그인 결과:', { data, error })
      
    } catch (err: any) {
      setResult({ error: err.message })
      console.error('에러:', err)
    } finally {
      setLoading(false)
    }
  }

  const createTestAccount = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'test123456'
      })
      
      setResult({ data, error })
      console.log('회원가입 결과:', { data, error })
      
    } catch (err: any) {
      setResult({ error: err.message })
      console.error('에러:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Supabase 연결 테스트</h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '설정 안됨'}</p>
        <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 설정 안됨'}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={createTestAccount}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          1. 테스트 계정 생성
        </button>
        
        <button 
          onClick={testLogin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          2. 로그인 테스트
        </button>
      </div>
      
      {loading && <p>처리 중...</p>}
      
      {result && (
        <div style={{
          background: result.error ? '#fee' : '#efe',
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${result.error ? '#fcc' : '#cfc'}`
        }}>
          <h3>{result.error ? '❌ 에러' : '✅ 성공'}</h3>
          <pre style={{ 
            overflow: 'auto',
            fontSize: '12px',
            background: 'white',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '40px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
        <h3>테스트 순서:</h3>
        <ol>
          <li>먼저 "테스트 계정 생성" 버튼 클릭</li>
          <li>그 다음 "로그인 테스트" 버튼 클릭</li>
          <li>결과 확인</li>
        </ol>
        <p style={{ marginTop: '10px', color: '#666' }}>
          테스트 계정: test@example.com / test123456
        </p>
      </div>
    </div>
  )
}