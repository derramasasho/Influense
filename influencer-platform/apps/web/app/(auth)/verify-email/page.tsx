'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Sparkles } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
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

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-display font-bold mb-2">Check your email</h1>
          <p className="text-muted-foreground">
            We've sent a verification link to
          </p>
          <p className="font-medium mt-1">{decodeURIComponent(email)}</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card-premium mb-6"
        >
          <h3 className="font-semibold mb-2">Next steps:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex">
              <span className="font-medium mr-2">1.</span>
              <span>Open the email we sent you</span>
            </li>
            <li className="flex">
              <span className="font-medium mr-2">2.</span>
              <span>Click the verification link</span>
            </li>
            <li className="flex">
              <span className="font-medium mr-2">3.</span>
              <span>Complete your profile setup</span>
            </li>
          </ol>
        </motion.div>

        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Didn't receive the email? Check your spam folder or
          </p>
          
          <button className="btn-glass w-full">
            Resend verification email
          </button>

          <Link 
            href="/login" 
            className="block text-center text-sm text-primary hover:underline"
          >
            Already verified? Sign in
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 p-4 rounded-xl bg-muted/50 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Welcome to Bulgaria's #1 creator platform</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}