'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
import { 
  Building2, 
  LogOut, 
  Settings, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Monitor, 
  FileText, 
  UserCheck,
  ChevronRight,
  Bell
} from 'lucide-react'

interface ModuleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  onClick: () => void
  hasAccess: boolean
}

function ModuleCard({ title, description, icon, color, onClick, hasAccess }: ModuleCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        hasAccess ? 'hover:shadow-2xl' : 'opacity-60 cursor-not-allowed'
      }`}
      onClick={hasAccess ? onClick : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-2xl ${color}`}>
            {icon}
          </div>
          {hasAccess && <ChevronRight className="h-5 w-5 text-gray-400" />}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg mb-2">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
        {!hasAccess && (
          <Badge variant="secondary" className="mt-2">
            Sem acesso
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { userProfile, signOut, hasPermission } = useAuth()
  const [activeModule, setActiveModule] = useState<string | null>(null)

  const modules = [
    {
      id: 'marketing',
      title: 'Marketing',
      description: 'Campanhas, leads e análise de performance',
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-pink-500 to-rose-500'
    },
    {
      id: 'crm',
      title: 'CRM',
      description: 'Gestão de clientes e relacionamentos',
      icon: <Users className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      id: 'financial',
      title: 'Financeiro',
      description: 'Controle financeiro e faturamento',
      icon: <DollarSign className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    {
      id: 'render',
      title: 'Render',
      description: 'Renderização e visualização 3D',
      icon: <Monitor className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-purple-500 to-violet-500'
    },
    {
      id: 'processes',
      title: 'Processos',
      description: 'Fluxos de trabalho e automação',
      icon: <FileText className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-orange-500 to-amber-500'
    },
    {
      id: 'users',
      title: 'Usuários',
      description: 'Gestão de usuários e permissões',
      icon: <UserCheck className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-indigo-500 to-blue-500'
    }
  ]

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId)
    console.log(`Clicou no módulo: ${moduleId}`)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CooArq
              </h1>
              <p className="text-sm text-gray-500">Plataforma Integrada</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {userProfile?.full_name ? getUserInitials(userProfile.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userProfile?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{userProfile?.role}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo, {userProfile?.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Escolha um módulo para começar a trabalhar
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              color={module.color}
              onClick={() => handleModuleClick(module.id)}
              hasAccess={hasPermission(module.id, 'read')}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Rápido</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Projetos Ativos</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Clientes</p>
                    <p className="text-2xl font-bold">48</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Receita Mensal</p>
                    <p className="text-2xl font-bold">R$ 45k</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Renders</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <Monitor className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}