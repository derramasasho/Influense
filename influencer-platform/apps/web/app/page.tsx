'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Globe,
  Heart,
  Star,
  CheckCircle,
  Play,
  Instagram,
  Youtube,
  Twitter
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'brand' | 'creator'>('brand')
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.9])

  const stats = [
    { label: 'Active Creators', value: '10,000+', icon: Users },
    { label: 'Successful Campaigns', value: '5,000+', icon: TrendingUp },
    { label: 'Brand Partners', value: '500+', icon: Heart },
    { label: 'Average ROI', value: '4.2x', icon: Zap },
  ]

  const features = {
    brand: [
      {
        icon: Sparkles,
        title: 'AI-Powered Matching',
        description: 'Find the perfect creators for your brand with our intelligent matching algorithm',
      },
      {
        icon: Shield,
        title: 'Verified Creators',
        description: 'Work with authenticated influencers with real engagement and proven results',
      },
      {
        icon: TrendingUp,
        title: 'Real-time Analytics',
        description: 'Track campaign performance with detailed insights and ROI metrics',
      },
      {
        icon: Zap,
        title: 'Fast & Secure Payments',
        description: 'Streamlined payment process with Stripe Connect integration',
      },
    ],
    creator: [
      {
        icon: Globe,
        title: 'Global Brand Access',
        description: 'Connect with top Bulgarian and international brands looking for creators',
      },
      {
        icon: Heart,
        title: 'Fair Compensation',
        description: 'Get paid what you deserve with transparent pricing and quick payouts',
      },
      {
        icon: Star,
        title: 'Build Your Portfolio',
        description: 'Showcase your best work and grow your professional creator profile',
      },
      {
        icon: CheckCircle,
        title: 'Easy Campaign Management',
        description: 'Simple tools to manage deliverables, deadlines, and communication',
      },
    ],
  }

  const testimonials = [
    {
      name: 'Maria Petrova',
      role: 'Fashion Influencer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      content: 'This platform changed my career. I\'ve worked with amazing brands and tripled my income in just 6 months.',
      rating: 5,
      platform: Instagram,
      followers: '125K',
    },
    {
      name: 'Stefan Dimitrov',
      role: 'Marketing Director',
      company: 'TechCorp Bulgaria',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      content: 'We\'ve seen a 4x return on our influencer campaigns. The quality of creators here is exceptional.',
      rating: 5,
    },
    {
      name: 'Elena Kostova',
      role: 'Lifestyle Creator',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      content: 'The platform is so intuitive! I love how easy it is to find campaigns that match my niche.',
      rating: 5,
      platform: Youtube,
      followers: '89K',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold">Influencer Platform</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How it Works
              </Link>
              <Link href="/creators" className="text-sm font-medium hover:text-primary transition-colors">
                For Creators
              </Link>
              <Link href="/brands" className="text-sm font-medium hover:text-primary transition-colors">
                For Brands
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="btn-premium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center hero-gradient pt-16"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center rounded-full bg-primary/10 px-6 py-2 text-sm font-medium text-primary">
                <Sparkles className="mr-2 h-4 w-4" />
                Bulgaria's #1 Influencer Marketing Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-balance"
            >
              Connect with Bulgaria's{' '}
              <span className="gradient-text">Top Creators</span>
              {' '}in Minutes
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Whether you're a brand looking to amplify your message or a creator ready to monetize your influence, 
              we make partnerships simple, secure, and successful.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup?type=brand" className="group relative btn-premium text-lg px-8 py-4">
                <span className="relative z-10 flex items-center">
                  I'm a Brand
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href="/signup?type=creator" className="btn-glass text-lg px-8 py-4 group">
                <span className="flex items-center">
                  I'm a Creator
                  <Heart className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </span>
              </Link>
            </motion.div>

            {/* Video Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 relative max-w-4xl mx-auto"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl glass-dark">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <button className="group relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white rounded-full p-6 shadow-2xl">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-display font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern influencer marketing
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-full bg-muted p-1">
              <button
                onClick={() => setActiveTab('brand')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'brand'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                For Brands
              </button>
              <button
                onClick={() => setActiveTab('creator')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'creator'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                For Creators
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features[activeTab].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-premium group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Loved by <span className="gradient-text">Creators & Brands</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful partnerships on our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-premium"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-sm mb-6 text-muted-foreground">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                      {testimonial.company && ` at ${testimonial.company}`}
                    </div>
                    {testimonial.platform && (
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <testimonial.platform className="h-3 w-3 mr-1" />
                        {testimonial.followers} followers
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-90" />
            <div className="relative z-10 text-center py-16 px-8">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
                Join Bulgaria's fastest-growing influencer marketing platform today
              </p>
              <Link href="/signup" className="btn-glass bg-white text-primary hover:bg-white/90">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-display text-lg font-bold">Influencer Platform</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bulgaria's premier influencer marketing platform connecting brands with creators.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/how-it-works" className="hover:text-foreground">How it Works</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/success-stories" className="hover:text-foreground">Success Stories</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/press" className="hover:text-foreground">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 Influencer Platform Bulgaria. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}