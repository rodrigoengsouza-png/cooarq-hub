'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, User, UserPermission } from '@/lib/supabase'

interface AuthContextType {
  user: SupabaseUser | null
  userProfile: User | null
  permissions: UserPermission[]
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  hasPermission: (module: string, action: 'read' | 'write' | 'delete') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUserProfile(null)
          setPermissions([])
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      // Carregar perfil do usuário
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setUserProfile(profile)
        
        // Carregar permissões
        const { data: userPermissions } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', userId)

        setPermissions(userPermissions || [])
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Erro de autenticação:', error)
        return { error: error.message }
      }

      // Aguardar um pouco para garantir que a sessão seja estabelecida
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await loadUserProfile(data.user.id)
      }

      return {}
    } catch (error) {
      console.error('Erro inesperado:', error)
      return { error: 'Erro inesperado ao fazer login' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      setPermissions([])
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const hasPermission = (module: string, action: 'read' | 'write' | 'delete') => {
    if (!userProfile) return false
    
    // Admin tem acesso total
    if (userProfile.role === 'admin') return true

    // Verificar permissão específica
    const permission = permissions.find(p => p.module === module)
    if (!permission) return false

    switch (action) {
      case 'read':
        return permission.can_read
      case 'write':
        return permission.can_write
      case 'delete':
        return permission.can_delete
      default:
        return false
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      permissions,
      loading,
      signIn,
      signOut,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}