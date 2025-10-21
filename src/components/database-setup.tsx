'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function DatabaseSetup() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const setupDatabase = async () => {
    setLoading(true)
    setError('')

    try {
      // Criar tabela de usuários
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'collaborator')) DEFAULT 'collaborator',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      // Criar tabela de permissões
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_permissions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            module TEXT NOT NULL CHECK (module IN ('marketing', 'crm', 'financial', 'render', 'processes', 'users')),
            can_read BOOLEAN DEFAULT false,
            can_write BOOLEAN DEFAULT false,
            can_delete BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, module)
          );
        `
      })

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao configurar banco de dados')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-green-700">Banco Configurado!</CardTitle>
          <CardDescription>
            O banco de dados foi configurado com sucesso.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <Database className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <CardTitle>Configurar Banco de Dados</CardTitle>
        <CardDescription>
          Configure as tabelas necessárias para a plataforma CooArq
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={setupDatabase}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Configurando...
            </>
          ) : (
            'Configurar Banco'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}