'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft,
  Target,
  DollarSign,
  Calendar,
  Package,
  Check,
  AlertCircle,
  Plus,
  X,
  Sparkles
} from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/app/lib/supabase/client'
import { Card } from '@influencer-platform/ui'
import { 
  platformSchema, 
  deliverableTypeSchema,
  type Platform,
  type DeliverableType 
} from '@influencer-platform/database'

const steps = [
  { id: 'basics', title: 'Campaign Basics', icon: Target },
  { id: 'requirements', title: 'Requirements', icon: Package },
  { id: 'budget', title: 'Budget & Timeline', icon: DollarSign },
  { id: 'review', title: 'Review & Launch', icon: Check },
]

// Form schemas for each step
const basicsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  objectives: z.array(z.string().min(1)).min(1, 'Add at least one objective').max(5),
  categories: z.array(z.string()).min(1, 'Select at least one category').max(5),
})

const requirementsSchema = z.object({
  platforms: z.array(platformSchema).min(1, 'Select at least one platform'),
  deliverables: z.array(z.object({
    type: deliverableTypeSchema,
    platform: platformSchema,
    quantity: z.number().int().min(1),
    description: z.string().optional(),
  })).min(1, 'Add at least one deliverable'),
  requirements: z.array(z.string().min(1)).min(1, 'Add at least one requirement').max(10),
  minFollowers: z.number().int().min(0).optional(),
  locationRequirements: z.array(z.string()).optional(),
  languageRequirements: z.array(z.string()).optional(),
})

const budgetSchema = z.object({
  budgetMin: z.number().min(50, 'Minimum budget must be at least 50 BGN'),
  budgetMax: z.number().min(50, 'Maximum budget must be at least 50 BGN'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
})

type BasicsData = z.infer<typeof basicsSchema>
type RequirementsData = z.infer<typeof requirementsSchema>
type BudgetData = z.infer<typeof budgetSchema>

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
  { id: 'business', label: 'Business', icon: '💼' },
]

const platformOptions: { value: Platform; label: string; icon: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '🎬' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'facebook', label: 'Facebook', icon: '👤' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
]

const deliverableTypes: { value: DeliverableType; label: string }[] = [
  { value: 'post', label: 'Feed Post' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel/Short' },
  { value: 'video', label: 'Video' },
  { value: 'live', label: 'Live Stream' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'other', label: 'Other' },
]

const languages = [
  { code: 'bg', label: 'Български' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
]

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form data state
  const [basicsData, setBasicsData] = useState<BasicsData | null>(null)
  const [requirementsData, setRequirementsData] = useState<RequirementsData | null>(null)
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null)

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

  const launchCampaign = async () => {
    if (!basicsData || !requirementsData || !budgetData) return

    setIsLoading(true)

    try {
      // Get current user and brand profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!brandProfile) throw new Error('Brand profile not found')

      // Create campaign
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          brand_id: brandProfile.id,
          title: basicsData.title,
          description: basicsData.description,
          objectives: basicsData.objectives,
          categories: basicsData.categories,
          platforms: requirementsData.platforms,
          deliverables: requirementsData.deliverables,
          requirements: requirementsData.requirements,
          min_followers: requirementsData.minFollowers,
          location_requirements: requirementsData.locationRequirements,
          language_requirements: requirementsData.languageRequirements,
          budget_min: budgetData.budgetMin,
          budget_max: budgetData.budgetMax,
          start_date: budgetData.startDate,
          end_date: budgetData.endDate,
          application_deadline: budgetData.applicationDeadline,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Campaign launched successfully! 🎉')
      router.push(`/dashboard/brand/campaigns/${campaign.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Create New Campaign</h1>
        <p className="text-muted-foreground mt-2">
          Launch a campaign to connect with perfect creators for your brand
        </p>
      </div>

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
          <BasicsStep
            onNext={(data) => {
              setBasicsData(data)
              nextStep()
            }}
            defaultValues={basicsData}
          />
        )}
        {currentStep === 1 && (
          <RequirementsStep
            onNext={(data) => {
              setRequirementsData(data)
              nextStep()
            }}
            onBack={prevStep}
            defaultValues={requirementsData}
          />
        )}
        {currentStep === 2 && (
          <BudgetStep
            onNext={(data) => {
              setBudgetData(data)
              nextStep()
            }}
            onBack={prevStep}
            defaultValues={budgetData}
          />
        )}
        {currentStep === 3 && (
          <ReviewStep
            basicsData={basicsData!}
            requirementsData={requirementsData!}
            budgetData={budgetData!}
            onBack={prevStep}
            onLaunch={launchCampaign}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Basics Step Component
function BasicsStep({ 
  onNext, 
  defaultValues 
}: { 
  onNext: (data: BasicsData) => void
  defaultValues: BasicsData | null
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BasicsData>({
    resolver: zodResolver(basicsSchema),
    defaultValues: defaultValues || {
      objectives: [''],
      categories: [],
    },
  })

  const objectives = watch('objectives') || ['']
  const selectedCategories = watch('categories') || []

  const addObjective = () => {
    if (objectives.length < 5) {
      setValue('objectives', [...objectives, ''])
    }
  }

  const removeObjective = (index: number) => {
    if (objectives.length > 1) {
      setValue('objectives', objectives.filter((_, i) => i !== index))
    }
  }

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setValue('categories', selectedCategories.filter(c => c !== categoryId))
    } else if (selectedCategories.length < 5) {
      setValue('categories', [...selectedCategories, categoryId])
    } else {
      toast.error('You can select up to 5 categories')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="p-6">
        <form onSubmit={handleSubmit(onNext)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Title</label>
            <input
              {...register('title')}
              className="input-premium w-full"
              placeholder="e.g., Summer Fashion Collection Launch"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-premium w-full resize-none"
              placeholder="Describe your campaign, what you're looking for, and what makes it special..."
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Campaign Objectives</label>
            <p className="text-xs text-muted-foreground mb-3">
              What do you want to achieve with this campaign?
            </p>
            <div className="space-y-2">
              {objectives.map((_, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    {...register(`objectives.${index}`)}
                    className="input-premium flex-1"
                    placeholder="e.g., Increase brand awareness"
                  />
                  {objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="p-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {objectives.length < 5 && (
              <button
                type="button"
                onClick={addObjective}
                className="mt-2 text-sm text-primary hover:underline flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add another objective
              </button>
            )}
            {errors.objectives && (
              <p className="text-sm text-destructive mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.objectives.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Categories</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedCategories.includes(category.id)
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="text-xl mb-1">{category.icon}</div>
                  <div className="text-xs font-medium">{category.label}</div>
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-sm text-destructive mt-2 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.categories.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-premium">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}

// Requirements Step Component
function RequirementsStep({ 
  onNext, 
  onBack,
  defaultValues 
}: { 
  onNext: (data: RequirementsData) => void
  onBack: () => void
  defaultValues: RequirementsData | null
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequirementsData>({
    resolver: zodResolver(requirementsSchema),
    defaultValues: defaultValues || {
      platforms: [],
      deliverables: [{ type: 'post', platform: 'instagram', quantity: 1 }],
      requirements: [''],
      locationRequirements: [],
      languageRequirements: [],
    },
  })

  const { fields: deliverableFields, append: addDeliverable, remove: removeDeliverable } = useFieldArray({
    control,
    name: 'deliverables',
  })

  const selectedPlatforms = watch('platforms') || []
  const requirements = watch('requirements') || ['']
  const selectedLanguages = watch('languageRequirements') || []

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setValue('platforms', selectedPlatforms.filter(p => p !== platform))
    } else {
      setValue('platforms', [...selectedPlatforms, platform])
    }
  }

  const addRequirement = () => {
    if (requirements.length < 10) {
      setValue('requirements', [...requirements, ''])
    }
  }

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setValue('requirements', requirements.filter((_, i) => i !== index))
    }
  }

  const toggleLanguage = (code: string) => {
    const current = selectedLanguages || []
    if (current.includes(code)) {
      setValue('languageRequirements', current.filter(l => l !== code))
    } else {
      setValue('languageRequirements', [...current, code])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="p-6">
        <form onSubmit={handleSubmit(onNext)} className="space-y-6">
          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium mb-3">Platforms</label>
            <div className="grid grid-cols-3 gap-3">
              {platformOptions.map((platform) => (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => togglePlatform(platform.value)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedPlatforms.includes(platform.value)
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="text-xl mb-1">{platform.icon}</div>
                  <div className="text-sm font-medium">{platform.label}</div>
                </button>
              ))}
            </div>
            {errors.platforms && (
              <p className="text-sm text-destructive mt-2 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.platforms.message}
              </p>
            )}
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-sm font-medium mb-2">Deliverables</label>
            <p className="text-xs text-muted-foreground mb-3">
              What content do you need from creators?
            </p>
            <div className="space-y-3">
              {deliverableFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select
                      {...register(`deliverables.${index}.type`)}
                      className="input-premium w-full"
                    >
                      {deliverableTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      {...register(`deliverables.${index}.platform`)}
                      className="input-premium w-full"
                    >
                      {platformOptions.map((platform) => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      {...register(`deliverables.${index}.quantity`, { valueAsNumber: true })}
                      className="input-premium w-full"
                      placeholder="Qty"
                      min="1"
                    />
                  </div>
                  {deliverableFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      className="p-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addDeliverable({ type: 'post', platform: 'instagram', quantity: 1 })}
              className="mt-2 text-sm text-primary hover:underline flex items-center"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add deliverable
            </button>
            {errors.deliverables && (
              <p className="text-sm text-destructive mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.deliverables.message}
              </p>
            )}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium mb-2">Requirements</label>
            <p className="text-xs text-muted-foreground mb-3">
              What are your requirements for creators?
            </p>
            <div className="space-y-2">
              {requirements.map((_, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    {...register(`requirements.${index}`)}
                    className="input-premium flex-1"
                    placeholder="e.g., Must have experience with fashion brands"
                  />
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="p-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {requirements.length < 10 && (
              <button
                type="button"
                onClick={addRequirement}
                className="mt-2 text-sm text-primary hover:underline flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add requirement
              </button>
            )}
            {errors.requirements && (
              <p className="text-sm text-destructive mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.requirements.message}
              </p>
            )}
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Followers (Optional)
              </label>
              <input
                type="number"
                {...register('minFollowers', { valueAsNumber: true })}
                className="input-premium w-full"
                placeholder="e.g., 1000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Location (Optional)
              </label>
              <input
                {...register('locationRequirements.0')}
                className="input-premium w-full"
                placeholder="e.g., Bulgaria"
              />
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Language Requirements (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggleLanguage(lang.code)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedLanguages.includes(lang.code)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
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
      </Card>
    </motion.div>
  )
}

// Budget Step Component
function BudgetStep({ 
  onNext, 
  onBack,
  defaultValues 
}: { 
  onNext: (data: BudgetData) => void
  onBack: () => void
  defaultValues: BudgetData | null
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BudgetData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: defaultValues || {
      budgetMin: 100,
      budgetMax: 1000,
    },
  })

  const budgetMin = watch('budgetMin')
  const budgetMax = watch('budgetMax')

  // Validate that max is greater than min
  const budgetError = budgetMax && budgetMin && budgetMax < budgetMin

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="p-6">
        <form onSubmit={handleSubmit(onNext)} className="space-y-6">
          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Budget Range (BGN)</label>
            <p className="text-xs text-muted-foreground mb-4">
              Set the budget range you're willing to pay per creator
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Minimum</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    {...register('budgetMin', { valueAsNumber: true })}
                    className="input-premium w-full pl-11"
                    placeholder="100"
                    min="50"
                  />
                </div>
                {errors.budgetMin && (
                  <p className="text-sm text-destructive mt-1">{errors.budgetMin.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Maximum</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    {...register('budgetMax', { valueAsNumber: true })}
                    className="input-premium w-full pl-11"
                    placeholder="1000"
                    min="50"
                  />
                </div>
                {errors.budgetMax && (
                  <p className="text-sm text-destructive mt-1">{errors.budgetMax.message}</p>
                )}
              </div>
            </div>
            {budgetError && (
              <p className="text-sm text-destructive mt-2 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Maximum budget must be greater than minimum budget
              </p>
            )}
          </div>

          {/* Platform Fee Notice */}
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Platform Fee: 25%</p>
                <p className="text-muted-foreground">
                  You'll pay {budgetMin || 100} - {budgetMax || 1000} BGN per creator, plus a 25% platform fee
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium mb-4">Campaign Timeline (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="input-premium w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">End Date</label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="input-premium w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Application Deadline</label>
                <input
                  type="date"
                  {...register('applicationDeadline')}
                  className="input-premium w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={onBack} className="btn-glass">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </button>
            <button type="submit" className="btn-premium" disabled={!!budgetError}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}

// Review Step Component
function ReviewStep({ 
  basicsData,
  requirementsData,
  budgetData,
  onBack,
  onLaunch,
  isLoading
}: { 
  basicsData: BasicsData
  requirementsData: RequirementsData
  budgetData: BudgetData
  onBack: () => void
  onLaunch: () => void
  isLoading: boolean
}) {
  const totalBudget = budgetData.budgetMax
  const platformFee = Math.round(totalBudget * 0.25)
  const totalCost = totalBudget + platformFee

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Campaign Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Campaign Summary</h3>
        
        <div className="space-y-4">
          {/* Basics */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Title</h4>
            <p>{basicsData.title}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
            <p className="text-sm">{basicsData.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Objectives</h4>
            <ul className="list-disc list-inside text-sm">
              {basicsData.objectives.filter(Boolean).map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {basicsData.categories.map((categoryId) => {
                const category = categories.find(c => c.id === categoryId)
                return category ? (
                  <span key={categoryId} className="px-3 py-1 rounded-full bg-muted text-sm">
                    {category.icon} {category.label}
                  </span>
                ) : null
              })}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Platforms</h4>
            <div className="flex flex-wrap gap-2">
              {requirementsData.platforms.map((platform) => {
                const platformOption = platformOptions.find(p => p.value === platform)
                return platformOption ? (
                  <span key={platform} className="px-3 py-1 rounded-full bg-muted text-sm">
                    {platformOption.icon} {platformOption.label}
                  </span>
                ) : null
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Deliverables</h4>
            <ul className="list-disc list-inside text-sm">
              {requirementsData.deliverables.map((deliverable, index) => {
                const type = deliverableTypes.find(t => t.value === deliverable.type)
                const platform = platformOptions.find(p => p.value === deliverable.platform)
                return (
                  <li key={index}>
                    {deliverable.quantity}x {type?.label} on {platform?.label}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </Card>

      {/* Budget Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Budget & Payment</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Budget per creator</span>
            <span>{budgetData.budgetMin} - {budgetData.budgetMax} BGN</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform fee (25%)</span>
            <span>~{platformFee} BGN</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold">
              <span>Estimated total per creator</span>
              <span>~{totalCost} BGN</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-muted/50">
          <p className="text-sm text-muted-foreground">
            💡 You'll only be charged when you accept a creator's application. 
            Launching the campaign is free.
          </p>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-glass" disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <button onClick={onLaunch} className="btn-premium" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Launching campaign...
            </>
          ) : (
            <>
              Launch Campaign
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}