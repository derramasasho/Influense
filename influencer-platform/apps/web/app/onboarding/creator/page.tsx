'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft,
  User, 
  MapPin, 
  Globe, 
  Instagram, 
  Youtube,
  Twitter,
  DollarSign,
  Camera,
  Check,
  Sparkles,
  Hash,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { createClient } from '@/app/lib/supabase/client'

const steps = [
  { id: 'profile', title: 'Basic Profile', icon: User },
  { id: 'social', title: 'Social Accounts', icon: Hash },
  { id: 'categories', title: 'Your Niche', icon: Sparkles },
  { id: 'pricing', title: 'Pricing', icon: DollarSign },
]

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(500, 'Bio must be less than 500 characters'),
  location: z.string().min(2, 'Location is required'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
})

const socialSchema = z.object({
  instagramHandle: z.string().optional(),
  instagramFollowers: z.number().min(0).optional(),
  youtubeHandle: z.string().optional(),
  youtubeSubscribers: z.number().min(0).optional(),
  tiktokHandle: z.string().optional(),
  tiktokFollowers: z.number().min(0).optional(),
  twitterHandle: z.string().optional(),
  twitterFollowers: z.number().min(0).optional(),
})

const categoriesSchema = z.object({
  categories: z.array(z.string()).min(1, 'Select at least one category').max(5, 'Select up to 5 categories'),
})

const pricingSchema = z.object({
  minCampaignBudget: z.number().min(50, 'Minimum budget must be at least 50 BGN'),
  preferredBudgetRange: z.object({
    min: z.number(),
    max: z.number(),
  }).refine(data => data.max > data.min, 'Maximum must be greater than minimum'),
})

type ProfileData = z.infer<typeof profileSchema>
type SocialData = z.infer<typeof socialSchema>
type CategoriesData = z.infer<typeof categoriesSchema>
type PricingData = z.infer<typeof pricingSchema>

const categories = [
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'beauty', label: 'Beauty', icon: '💄' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'photography', label: 'Photography', icon: '📸' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'parenting', label: 'Parenting', icon: '👶' },
  { id: 'pets', label: 'Pets', icon: '🐾' },
  { id: 'other', label: 'Other', icon: '✨' },
]

const languages = [
  { code: 'bg', label: 'Български' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'gr', label: 'Ελληνικά' },
]

export default function CreatorOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form data state
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [socialData, setSocialData] = useState<SocialData | null>(null)
  const [categoriesData, setCategoriesData] = useState<CategoriesData | null>(null)

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

  const completeOnboarding = async (pricingData: PricingData) => {
    setIsLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: profileData!.fullName,
          username: profileData!.username,
          onboarding_completed: true,
          status: 'active',
        })
        .eq('id', user.id)

      if (userError) throw userError

      // Create influencer profile
      const { error: profileError } = await supabase
        .from('influencer_profiles')
        .insert({
          user_id: user.id,
          bio: profileData!.bio,
          location: profileData!.location,
          languages: profileData!.languages,
          categories: categoriesData!.categories,
          instagram_handle: socialData?.instagramHandle,
          instagram_followers: socialData?.instagramFollowers || 0,
          youtube_handle: socialData?.youtubeHandle,
          youtube_subscribers: socialData?.youtubeSubscribers || 0,
          tiktok_handle: socialData?.tiktokHandle,
          tiktok_followers: socialData?.tiktokFollowers || 0,
          twitter_handle: socialData?.twitterHandle,
          twitter_followers: socialData?.twitterFollowers || 0,
          min_campaign_budget: pricingData.minCampaignBudget,
        })

      if (profileError) throw profileError

      toast.success('Welcome to the platform! 🎉')
      router.push('/dashboard/creator')
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
            <ProfileStep
              onNext={(data) => {
                setProfileData(data)
                nextStep()
              }}
            />
          )}
          {currentStep === 1 && (
            <SocialStep
              onBack={prevStep}
              onNext={(data) => {
                setSocialData(data)
                nextStep()
              }}
            />
          )}
          {currentStep === 2 && (
            <CategoriesStep
              onBack={prevStep}
              onNext={(data) => {
                setCategoriesData(data)
                nextStep()
              }}
            />
          )}
          {currentStep === 3 && (
            <PricingStep
              isLoading={isLoading}
              onBack={prevStep}
              onComplete={completeOnboarding}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Profile Step Component
function ProfileStep({ onNext }: { onNext: (data: ProfileData) => void }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      languages: ['bg'],
    },
  })

  const selectedLanguages = watch('languages') || []

  const toggleLanguage = (code: string) => {
    const current = selectedLanguages || []
    if (current.includes(code)) {
      setValue('languages', current.filter(l => l !== code))
    } else {
      setValue('languages', [...current, code])
    }
  }

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="card-premium max-w-2xl mx-auto"
      exit={{ opacity: 0, x: -20 }}
      initial={{ opacity: 0, x: 20 }}
    >
      <div className="p-8">
        <h2 className="text-2xl font-display font-bold mb-2">Let's set up your profile</h2>
        <p className="text-muted-foreground mb-6">
          This information will be visible to brands looking for creators
        </p>

        <form className="space-y-6" onSubmit={handleSubmit(onNext)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                {...register('fullName')}
                className="input-premium w-full"
                placeholder="Maria Petrova"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <input
                  {...register('username')}
                  className="input-premium w-full pl-8"
                  placeholder="mariapetrova"
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive mt-1">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              {...register('bio')}
              className="input-premium w-full resize-none"
              placeholder="Tell brands about yourself, your content style, and what makes you unique..."
              rows={4}
            />
            {errors.bio && (
              <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                {...register('location')}
                className="input-premium w-full pl-11"
                placeholder="Sofia, Bulgaria"
              />
            </div>
            {errors.location && (
              <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Languages</label>
            <div className="grid grid-cols-4 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    selectedLanguages.includes(lang.code)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  type="button"
                  onClick={() => toggleLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            {errors.languages && (
              <p className="text-sm text-destructive mt-2">{errors.languages.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button className="btn-premium" type="submit">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

// Social Step Component
function SocialStep({ 
  onNext, 
  onBack 
}: { 
  onNext: (data: SocialData) => void
  onBack: () => void 
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialData>({
    resolver: zodResolver(socialSchema),
  })

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="card-premium max-w-2xl mx-auto"
      exit={{ opacity: 0, x: -20 }}
      initial={{ opacity: 0, x: 20 }}
    >
      <div className="p-8">
        <h2 className="text-2xl font-display font-bold mb-2">Connect your social accounts</h2>
        <p className="text-muted-foreground mb-6">
          Help brands understand your reach and engagement
        </p>

        <form className="space-y-6" onSubmit={handleSubmit(onNext)}>
          {/* Instagram */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Instagram className="h-6 w-6 text-pink-500" />
              <h3 className="font-semibold">Instagram</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-9">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  {...register('instagramHandle')}
                  className="input-premium w-full"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Followers</label>
                <input
                  type="number"
                  {...register('instagramFollowers', { valueAsNumber: true })}
                  className="input-premium w-full"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>

          {/* YouTube */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Youtube className="h-6 w-6 text-red-500" />
              <h3 className="font-semibold">YouTube</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-9">
              <div>
                <label className="block text-sm font-medium mb-2">Channel</label>
                <input
                  {...register('youtubeHandle')}
                  className="input-premium w-full"
                  placeholder="@channel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subscribers</label>
                <input
                  type="number"
                  {...register('youtubeSubscribers', { valueAsNumber: true })}
                  className="input-premium w-full"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* TikTok */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <h3 className="font-semibold">TikTok</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-9">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  {...register('tiktokHandle')}
                  className="input-premium w-full"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Followers</label>
                <input
                  type="number"
                  {...register('tiktokFollowers', { valueAsNumber: true })}
                  className="input-premium w-full"
                  placeholder="15000"
                />
              </div>
            </div>
          </div>

          {/* Twitter */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Twitter className="h-6 w-6 text-blue-400" />
              <h3 className="font-semibold">Twitter</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-9">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  {...register('twitterHandle')}
                  className="input-premium w-full"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Followers</label>
                <input
                  type="number"
                  {...register('twitterFollowers', { valueAsNumber: true })}
                  className="input-premium w-full"
                  placeholder="3000"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button className="btn-glass" type="button" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </button>
            <button className="btn-premium" type="submit">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

// Categories Step Component
function CategoriesStep({ 
  onNext, 
  onBack 
}: { 
  onNext: (data: CategoriesData) => void
  onBack: () => void 
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId))
    } else if (selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      toast.error('You can select up to 5 categories')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category')
      return
    }
    onNext({ categories: selectedCategories })
  }

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="card-premium max-w-3xl mx-auto"
      exit={{ opacity: 0, x: -20 }}
      initial={{ opacity: 0, x: 20 }}
    >
      <div className="p-8">
        <h2 className="text-2xl font-display font-bold mb-2">What's your niche?</h2>
        <p className="text-muted-foreground mb-6">
          Select up to 5 categories that best describe your content
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`p-4 rounded-2xl text-center transition-all ${
                  selectedCategories.includes(category.id)
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                type="button"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-sm font-medium">{category.label}</div>
              </button>
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              {selectedCategories.length}/5 categories selected
            </p>
          </div>

          <div className="flex justify-between">
            <button className="btn-glass" type="button" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </button>
            <button className="btn-premium" type="submit">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

// Pricing Step Component
function PricingStep({ 
  onComplete, 
  onBack,
  isLoading 
}: { 
  onComplete: (data: PricingData) => void
  onBack: () => void
  isLoading: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PricingData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      minCampaignBudget: 100,
      preferredBudgetRange: {
        min: 100,
        max: 1000,
      },
    },
  })

  const minBudget = watch('minCampaignBudget')

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="card-premium max-w-2xl mx-auto"
      exit={{ opacity: 0, x: -20 }}
      initial={{ opacity: 0, x: 20 }}
    >
      <div className="p-8">
        <h2 className="text-2xl font-display font-bold mb-2">Set your pricing</h2>
        <p className="text-muted-foreground mb-6">
          Help brands understand your rates and budget expectations
        </p>

        <form className="space-y-6" onSubmit={handleSubmit(onComplete)}>
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Campaign Budget (BGN)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                {...register('minCampaignBudget', { valueAsNumber: true })}
                className="input-premium w-full pl-11"
                placeholder="100"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              The minimum budget you'll accept for a campaign
            </p>
            {errors.minCampaignBudget && (
              <p className="text-sm text-destructive mt-1">{errors.minCampaignBudget.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-4">
              Preferred Budget Range (BGN)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">From</label>
                <input
                  type="number"
                  {...register('preferredBudgetRange.min', { valueAsNumber: true })}
                  className="input-premium w-full"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">To</label>
                <input
                  type="number"
                  {...register('preferredBudgetRange.max', { valueAsNumber: true })}
                  className="input-premium w-full"
                  placeholder="1000"
                />
              </div>
            </div>
            {errors.preferredBudgetRange && (
              <p className="text-sm text-destructive mt-2">{errors.preferredBudgetRange.message}</p>
            )}
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Platform Fee: 25%</p>
                <p className="text-muted-foreground">
                  For a {minBudget || 100} BGN campaign, you'll receive {Math.round((minBudget || 100) * 0.75)} BGN after fees
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button className="btn-glass" disabled={isLoading} type="button" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </button>
            <button className="btn-premium" disabled={isLoading} type="submit">
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