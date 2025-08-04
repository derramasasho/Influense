'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      // Get user profile to determine redirect
      const { data: profile } = await supabase
        .from('users')
        .select('role, onboarding_completed')
        .eq('id', authData.user.id)
        .single()

      toast.success('Welcome back!')

      // Redirect based on role and onboarding status
      if (!profile?.onboarding_completed) {
        router.push('/onboarding')
      } else if (profile.role === 'influencer') {
        router.push('/dashboard/creator')
      } else if (profile.role === 'brand') {
        router.push('/dashboard/brand')
      } else if (profile.role === 'admin') {
        router.push('/dashboard/admin')
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="font-display text-2xl font-bold">Influencer Platform</span>
            </div>
            
            <h1 className="text-3xl font-display font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  {...register('email')}
                  className="input-premium w-full pl-11"
                  placeholder="maria@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="input-premium w-full pl-11 pr-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-premium w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              className="btn-glass w-full"
              onClick={() => {
                toast('Google sign in coming soon!', { icon: '🚀' })
              }}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Magic Link */}
            <button
              type="button"
              className="btn-glass w-full"
              onClick={() => {
                toast('Magic link login coming soon!', { icon: '✨' })
              }}
            >
              <Mail className="h-5 w-5 mr-2" />
              Sign in with Magic Link
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right Panel - Image/Graphics */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-white p-12"
          >
            <h2 className="text-4xl font-display font-bold mb-4">
              Welcome Back to Bulgaria's #1 Creator Platform
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">
              Connect, collaborate, and grow with thousands of creators and brands.
            </p>
            
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-4xl font-bold">10K+</div>
                <div className="text-sm text-white/80">Active Creators</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-sm text-white/80">Brand Partners</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-4xl font-bold">5K+</div>
                <div className="text-sm text-white/80">Campaigns</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}