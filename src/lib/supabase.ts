import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Configuração do cliente Supabase com opções para resolver CORS
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'collaborator'
  created_at: string
  updated_at: string
}

export interface UserPermission {
  id: string
  user_id: string
  module: 'marketing' | 'crm' | 'financial' | 'render' | 'processes' | 'users'
  can_read: boolean
  can_write: boolean
  can_delete: boolean
  created_at: string
}

export interface Module {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  is_active: boolean
  order: number
}