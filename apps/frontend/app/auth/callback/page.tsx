'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    const token = searchParams.get('token')

    if (token) {
      // Store the JWT token from backend
      localStorage.setItem('authToken', token)
      router.push('/')
    } else if (session) {
      // NextAuth session is available
      router.push('/')
    } else {
      // No authentication, redirect to home
      router.push('/')
    }
  }, [status, session, router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
