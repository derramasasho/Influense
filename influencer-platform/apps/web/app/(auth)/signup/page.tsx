'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Check,
  AlertCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['influencer', 'brand']),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const defaultRole = searchParams.get('type') as 'brand' | 'creator' | null
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: defaultRole === 'creator' ? 'influencer' : defaultRole === 'brand' ? 'brand' : 'influencer',
    },
  })

  const selectedRole = watch('role')

  useEffect(() => {
    if (defaultRole) {
      setValue('role', defaultRole === 'creator' ? 'influencer' : 'brand')
    }
  }, [defaultRole, setValue])

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      })

      if (authError) throw authError

      toast.success('Account created! Please check your email to verify your account.')
      router.push('/verify-email?email=' + encodeURIComponent(data.email))
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = {
    influencer: [
      'Connect with top Bulgarian & international brands',
      'Set your own rates and terms',
      'Secure payments via Stripe',
      'Build your professional portfolio',
      'Access to exclusive campaigns',
    ],
    brand: [
      'Access to 10,000+ verified creators',
      'AI-powered creator matching',
      'Campaign performance analytics',
      'Secure payment processing',
      'Dedicated account support',
    ],
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
            
            <h1 className="text-3xl font-display font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              Join Bulgaria's #1 influencer marketing platform
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    value="influencer"
                    {...register('role')}
                    className="sr-only peer"
                  />
                  <div className="card-premium peer-checked:ring-2 peer-checked:ring-primary peer-checked:border-primary transition-all">
                    <User className="h-8 w-8 mb-2 text-primary" />
                    <div className="font-medium">Creator</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Monetize your influence
                    </div>
                  </div>
                </label>
                
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    value="brand"
                    {...register('role')}
                    className="sr-only peer"
                  />
                  <div className="card-premium peer-checked:ring-2 peer-checked:ring-primary peer-checked:border-primary transition-all">
                    <Building2 className="h-8 w-8 mb-2 text-primary" />
                    <div className="font-medium">Brand</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Find perfect creators
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                {...register('fullName')}
                className="input-premium w-full"
                placeholder="Maria Petrova"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

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
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="input-premium w-full pl-11 pr-11"
                  placeholder="••••••••"
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

            {/* Terms */}
            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  className="mt-1 rounded border-input"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-destructive mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.agreeToTerms.message}
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
                  Creating account...
                </div>
              ) : (
                'Create Account'
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

            {/* Google Sign Up */}
            <button
              type="button"
              className="btn-glass w-full"
              onClick={() => {
                toast('Google sign up coming soon!', { icon: '🚀' })
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

            {/* Sign In Link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-12 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md"
        >
          <h2 className="text-3xl font-display font-bold mb-6">
            {selectedRole === 'influencer' ? 'Start earning today' : 'Find perfect creators'}
          </h2>
          
          <ul className="space-y-4">
            {features[selectedRole].map((feature, index) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-start"
              >
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 p-6 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/50"
          >
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-5 w-5 text-yellow-500 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic mb-2">
              "This platform transformed how we work with influencers. The quality of creators and the ease of use is unmatched."
            </p>
            <p className="text-sm font-medium">
              {selectedRole === 'influencer' ? 'Elena K., Fashion Creator' : 'Stefan D., Marketing Director'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}