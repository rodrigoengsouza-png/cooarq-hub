'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  Building2, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone,
  ArrowLeft,
  Check,
  X,
  Shield,
  HelpCircle
} from 'lucide-react'

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function LoginForm() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [], color: 'text-gray-400' })
  const { signIn } = useAuth()

  // Auto-focus no primeiro campo
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = document.querySelector('input[type="email"]') as HTMLInputElement
      if (firstInput) firstInput.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [mode])

  // Validação de força da senha
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido')
      setLoading(false)
      return
    }

    const result = await signIn(email, password)
    
    if (result.error) {
      if (result.error.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.')
      } else {
        setError(result.error)
      }
    }
    
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido')
      setLoading(false)
      return
    }

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

    if (!acceptTerms) {
      setError('Você deve aceitar os Termos de Uso e Política de Privacidade')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este e-mail já está cadastrado. Tente fazer login.')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess('Conta criada com sucesso! Verifique seu e-mail para confirmar sua conta.')
        setMode('verify-email')
      }
    } catch (error) {
      setError('Erro inesperado ao criar conta')
    }
    
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Enviamos instruções para seu e-mail. Verifique sua caixa de entrada.')
        setEmailSent(true)
      }
    } catch (error) {
      setError('Erro inesperado ao enviar e-mail de recuperação')
    }
    
    setLoading(false)
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(`Erro ao fazer login com ${provider}`)
      }
    } catch (error) {
      setError('Erro inesperado no login social')
    }
    
    setLoading(false)
  }

  const resendVerificationEmail = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess('E-mail de verificação reenviado!')
      }
    } catch (error) {
      setError('Erro ao reenviar e-mail')
    }
    setLoading(false)
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

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          E-mail
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            disabled={loading}
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Senha
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
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={loading}
          />
          <Label htmlFor="remember" className="text-sm text-gray-600">
            Lembrar-me
          </Label>
        </div>
        <button
          type="button"
          onClick={() => setMode('forgot-password')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          disabled={loading}
        >
          Esqueci minha senha
        </button>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 transition-all duration-200"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Nome completo
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="fullName"
            type="text"
            placeholder="Seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="pl-10"
            required
            disabled={loading}
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          E-mail
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Telefone
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Senha
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
          Confirmar senha
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

      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            disabled={loading}
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
            Aceito os{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">
              Política de Privacidade
            </a>
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="newsletter"
            checked={newsletter}
            onCheckedChange={(checked) => setNewsletter(checked as boolean)}
            disabled={loading}
            className="mt-1"
          />
          <Label htmlFor="newsletter" className="text-sm text-gray-600 leading-relaxed">
            Quero receber novidades e atualizações por e-mail
          </Label>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2.5 transition-all duration-200"
        disabled={loading || !acceptTerms}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta'
        )}
      </Button>
    </form>
  )

  const renderForgotPasswordForm = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <button
          onClick={() => setMode('login')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar ao login
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Recuperar senha</h3>
        <p className="text-sm text-gray-600 mt-1">
          Digite seu e-mail para receber instruções de recuperação
        </p>
      </div>

      {!emailSent ? (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar instruções'
            )}
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-800">
              Instruções enviadas para <strong>{email}</strong>
            </p>
          </div>
          <Button
            onClick={resendVerificationEmail}
            variant="outline"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reenviando...
              </>
            ) : (
              'Reenviar e-mail'
            )}
          </Button>
        </div>
      )}
    </div>
  )

  const renderVerifyEmailForm = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Verifique seu e-mail</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enviamos um link de verificação para <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-blue-800">
            Clique no link do e-mail para ativar sua conta. Não esqueça de verificar a pasta de spam!
          </p>
        </div>

        <Button
          onClick={resendVerificationEmail}
          variant="outline"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reenviando...
            </>
          ) : (
            'Reenviar e-mail de verificação'
          )}
        </Button>

        <Button
          onClick={() => setMode('login')}
          variant="ghost"
          className="w-full"
        >
          Voltar ao login
        </Button>
      </div>
    </div>
  )

  const renderSocialLogin = () => (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Ou continue com</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-2.5 border-gray-300 hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Entrar com Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('facebook')}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-2.5 border-gray-300 hover:bg-gray-50"
        >
          <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Entrar com Facebook</span>
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500 mt-3">
        Não postaremos nada sem sua permissão
      </p>
    </div>
  )

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
              {mode === 'login' && 'Faça login para acessar sua plataforma'}
              {mode === 'register' && 'Crie sua conta na plataforma'}
              {mode === 'forgot-password' && 'Recupere o acesso à sua conta'}
              {mode === 'verify-email' && 'Confirme seu e-mail para continuar'}
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

            {mode === 'login' && (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register" onClick={() => setMode('register')}>
                    Criar conta
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-6">
                  {renderLoginForm()}
                  {renderSocialLogin()}
                </TabsContent>
              </Tabs>
            )}

            {mode === 'register' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => setMode('login')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Já tem uma conta? Faça login
                  </Button>
                </div>
                {renderRegisterForm()}
                {renderSocialLogin()}
              </div>
            )}

            {mode === 'forgot-password' && renderForgotPasswordForm()}
            {mode === 'verify-email' && renderVerifyEmailForm()}
          </CardContent>

          <div className="px-6 pb-6">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <a href="/help" className="flex items-center hover:text-gray-700 transition-colors">
                <HelpCircle className="h-3 w-3 mr-1" />
                Ajuda
              </a>
              <span>•</span>
              <a href="/privacy" className="hover:text-gray-700 transition-colors">
                Privacidade
              </a>
              <span>•</span>
              <a href="/terms" className="hover:text-gray-700 transition-colors">
                Termos
              </a>
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400">
                © 2024 CooArq. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </Card>

        {/* Security Badge */}
        <div className="flex items-center justify-center mt-6 text-xs text-gray-500">
          <Shield className="h-4 w-4 mr-2" />
          <span>Conexão segura e criptografada</span>
        </div>
      </div>
    </div>
  )
}