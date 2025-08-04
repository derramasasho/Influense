'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft,
  Building2, 
  Globe, 
  Users,
  Check,
  Sparkles,
  Upload,
  Link as LinkIcon
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/app/lib/supabase/client'

const steps = [
  { id: 'company', title: 'Company Info', icon: Building2 },
  { id: 'details', title: 'Brand Details', icon: Globe },
  { id: 'team', title: 'Team Size', icon: Users },
]

const companySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  industry: z.string().min(2, 'Please select an industry'),
})

const detailsSchema = z.object({
  description: z.string().min(50, 'Description must be at least 50 characters').max(500),
  location: z.string().min(2, 'Location is required'),
  targetAudience: z.array(z.string()).min(1, 'Select at least one target audience'),
})

const teamSchema = z.object({
  companySize: z.string().min(1, 'Please select company size'),
  marketingBudget: z.string().min(1, 'Please select marketing budget range'),
})

type CompanyData = z.infer<typeof companySchema>
type DetailsData = z.infer<typeof detailsSchema>
type TeamData = z.infer<typeof teamSchema>

const industries = [
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Food & Beverage',
  'Technology',
  'Health & Wellness',
  'Travel & Tourism',
  'Entertainment',
  'Sports & Fitness',
  'Home & Living',
  'Education',
  'Finance',
  'E-commerce',
  'Automotive',
  'Real Estate',
  'Other',
]

const targetAudiences = [
  { id: 'gen-z', label: 'Gen Z (18-24)', icon: '🎮' },
  { id: 'millennials', label: 'Millennials (25-40)', icon: '📱' },
  { id: 'gen-x', label: 'Gen X (41-56)', icon: '💼' },
  { id: 'families', label: 'Families', icon: '👨‍👩‍👧‍👦' },
  { id: 'professionals', label: 'Professionals', icon: '👔' },
  { id: 'students', label: 'Students', icon: '🎓' },
  { id: 'parents', label: 'Parents', icon: '👶' },
  { id: 'seniors', label: 'Seniors (57+)', icon: '👴' },
]

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
]

const budgetRanges = [
  { value: '0-5k', label: 'Under 5,000 BGN/month' },
  { value: '5k-20k', label: '5,000 - 20,000 BGN/month' },
  { value: '20k-50k', label: '20,000 - 50,000 BGN/month' },
  { value: '50k+', label: '50,000+ BGN/month' },
]

export default function BrandOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form data state
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [detailsData, setDetailsData] = useState<DetailsData | null>(null)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async (teamData: TeamData) => {
    setIsLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: companyData!.companyName,
          onboarding_completed: true,
          status: 'active',
        })
        .eq('id', user.id)

      if (userError) throw userError

      // Create brand profile
      const { error: profileError } = await supabase
        .from('brand_profiles')
        .insert({
          user_id: user.id,
          company_name: companyData!.companyName,
          website: companyData!.website || null,
          industry: companyData!.industry,
          description: detailsData!.description,
          location: detailsData!.location,
          company_size: teamData.companySize,
        })

      if (profileError) throw profileError

      toast.success('Welcome to the platform! 🎉')
      router.push('/dashboard/brand')
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                    index <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-center ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <CompanyStep
              onNext={(data) => {
                setCompanyData(data)
                nextStep()
              }}
            />
          )}
          {currentStep === 1 && (
            <DetailsStep
              onNext={(data) => {
                setDetailsData(data)
                nextStep()
              }}
              onBack={prevStep}
            />
          )}
          {currentStep === 2 && (
            <TeamStep
              onComplete={completeOnboarding}
              onBack={prevStep}
              isLoading={isLoading}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Company Step Component
function CompanyStep({ onNext }: { onNext: (data: CompanyData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyData>({
    resolver: zodResolver(companySchema),
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card-premium max-w-2xl mx-auto"
    >
      <div className="p-8">
        <h2 className="text-2xl font-display font-bold mb-2">Tell us about your company</h2>
        <p className="text-muted-foreground mb-6">
          This helps creators understand your brand better
        </p>

        <form onSubmit={handleSubmit(onNext)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                {...register('companyName')}
                className="input-premium w-full pl-11"
                placeholder="Acme Corporation"
              />
            </div>
            {errors.companyName && (
              <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website (Optional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                {...register('website')}
                className="input-premium w-full pl-11"
                placeholder="https://example.com"
              />
            </div>
            {errors.website && (
              <p className="text-sm text-destructive mt-1">{errors.website.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <select
              {...register('industry')}
              className="input-premium w-full"
            >
              <option value="">Select an industry</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="text-sm text-destructive mt-1">{errors.industry.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-premium">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

// Details Step Component
function DetailsStep({ 
  onNext, 
  onBack 
}: { 
  onNext: (data: DetailsData) => void
  onBack: () => void 
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DetailsData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      targetAudience: [],
    },
  })

  const selectedAudiences = watch('targetAudience') || []

  const toggleAudience = (audienceId: string) => {
    const current = selectedAudiences || []
    if (current.includes(audienceId)) {
      setValue('targetAudience', current.filter(a => a !== audienceId))
    } else {
      setValue('targetAudience', [...current, audienceId])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card-premium max-w-2xl mx-auto"
    >
      <div className="p-8">
        <h2 className="text-2xl font-display font-bold mb-2">Brand details</h2>
        <p className="text-muted-foreground mb-6">
          Help creators understand what you're looking for
        </p>

        <form onSubmit={handleSubmit(onNext)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Brand Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-premium w-full resize-none"
              placeholder="Tell creators about your brand, values, and what makes you unique..."
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              {...register('location')}
              className="input-premium w-full"
              placeholder="Sofia, Bulgaria"
            />
            {errors.location && (
              <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Target Audience</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {targetAudiences.map((audience) => (
                <button
                  key={audience.id}
                  type="button"
                  onClick={() => toggleAudience(audience.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedAudiences.includes(audience.id)
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="text-xl mb-1">{audience.icon}</div>
                  <div className="text-xs font-medium">{audience.label}</div>
                </button>
              ))}
            </div>
            {errors.targetAudience && (
              <p className="text-sm text-destructive mt-2">{errors.targetAudience.message}</p>
            )}
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={onBack} className="btn-glass">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </button>
            <button type="submit" className="btn-premium">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

// Team Step Component
function TeamStep({ 
  onComplete, 
  onBack,
  isLoading 
}: { 
  onComplete: (data: TeamData) => void
  onBack: () => void
  isLoading: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamData>({
    resolver: zodResolver(teamSchema),
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card-premium max-w-2xl mx-auto"
    >
      <div className="p-8">
        <h2 className="text-2xl font-display font-bold mb-2">Team & Budget</h2>
        <p className="text-muted-foreground mb-6">
          This helps us recommend the right creators for your budget
        </p>

        <form onSubmit={handleSubmit(onComplete)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Company Size</label>
            <div className="grid grid-cols-1 gap-2">
              {companySizes.map((size) => (
                <label key={size.value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    value={size.value}
                    {...register('companySize')}
                    className="sr-only peer"
                  />
                  <div className="p-4 rounded-xl border-2 border-muted peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{size.label}</span>
                      <div className="w-5 h-5 rounded-full border-2 border-muted peer-checked:border-primary peer-checked:bg-primary" />
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.companySize && (
              <p className="text-sm text-destructive mt-2">{errors.companySize.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Monthly Marketing Budget</label>
            <div className="grid grid-cols-1 gap-2">
              {budgetRanges.map((budget) => (
                <label key={budget.value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    value={budget.value}
                    {...register('marketingBudget')}
                    className="sr-only peer"
                  />
                  <div className="p-4 rounded-xl border-2 border-muted peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{budget.label}</span>
                      <div className="w-5 h-5 rounded-full border-2 border-muted peer-checked:border-primary peer-checked:bg-primary" />
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.marketingBudget && (
              <p className="text-sm text-destructive mt-2">{errors.marketingBudget.message}</p>
            )}
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Ready to launch campaigns!</p>
                <p className="text-muted-foreground">
                  You can start creating campaigns and connecting with creators immediately after setup.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={onBack} className="btn-glass" disabled={isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </button>
            <button type="submit" className="btn-premium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Completing setup...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}