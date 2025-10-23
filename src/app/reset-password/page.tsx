'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Lock, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [], color: 'text-gray-400' })
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar se há um token de reset na URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      // Definir a sessão com os tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
    }
  }, [searchParams])

  useEffect(() => {
    if (password) {
      const strength = calculatePasswordStrength(password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: 'text-gray-400' })
    }
  }, [password])

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []
    
    if (pwd.length >= 8) score += 1
    else feedback.push('Mínimo 8 caracteres')
    
    if (/[a-z]/.test(pwd)) score += 1
    else feedback.push('Letra minúscula')
    
    if (/[A-Z]/.test(pwd)) score += 1
    else feedback.push('Letra maiúscula')
    
    if (/\d/.test(pwd)) score += 1
    else feedback.push('Número')
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1
    else feedback.push('Caractere especial')

    let color = 'text-red-500'
    if (score >= 4) color = 'text-green-500'
    else if (score >= 3) color = 'text-yellow-500'
    else if (score >= 2) color = 'text-orange-500'

    return { score, feedback, color }
  }

  const renderPasswordStrengthIndicator = () => {
    if (!password) return null

    const strengthLabels = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Forte']
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

    return (
      <div className="mt-2 space-y-2">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded ${
                level <= passwordStrength.score ? strengthColors[passwordStrength.score - 1] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className={passwordStrength.color}>
            {passwordStrength.score > 0 ? strengthLabels[passwordStrength.score - 1] : 'Digite uma senha'}
          </span>
          {passwordStrength.feedback.length > 0 && (
            <span className="text-gray-500">
              Falta: {passwordStrength.feedback.join(', ')}
            </span>
          )}
        </div>
      </div>
    )
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (passwordStrength.score < 3) {
      setError('Senha muito fraca. Siga as recomendações de segurança.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Senha alterada com sucesso! Redirecionando...')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (error) {
      setError('Erro inesperado ao alterar senha')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-lg">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CooArq
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Defina sua nova senha
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <X className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 animate-in slide-in-from-top-2">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Nova senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {renderPasswordStrengthIndicator()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar nova senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {confirmPassword && (
                    <div className="absolute right-10 top-3">
                      {password === confirmPassword ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2.5 transition-all duration-200"
                disabled={loading || password !== confirmPassword || passwordStrength.score < 3}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando senha...
                  </>
                ) : (
                  'Alterar senha'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}