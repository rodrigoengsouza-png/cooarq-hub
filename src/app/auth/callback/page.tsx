'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro na autenticação:', error)
          router.push('/?error=auth_error')
          return
        }

        if (data.session) {
          // Usuário autenticado com sucesso
          router.push('/')
        } else {
          // Sem sessão, redirecionar para login
          router.push('/')
        }
      } catch (error) {
        console.error('Erro inesperado:', error)
        router.push('/?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Finalizando autenticação...</p>
      </div>
    </div>
  )
}