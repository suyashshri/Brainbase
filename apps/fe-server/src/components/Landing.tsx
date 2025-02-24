'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import {
  BrainCog,
  Search,
  FileText,
  Image,
  Link as LinkIcon,
  Database,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'
import Header from './Header'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />

      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 gradient-animate" />
        <div className="relative">
          <h1 className="text-7xl font-bold tracking-tight mb-6 p-4 font-outfit bg-gradient-to-r from-purple-700 to-blue-500 bg-clip-text text-transparent animate-float">
            Your Knowledge Base,
            <br />
            Supercharged with AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Store, organize, and instantly find any piece of information using
            our advanced AI-powered search. From PDFs to images, BrainBase
            remembers everything so you don't have to.
          </p>
          <div className="flex justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 group transition-all duration-300"
            >
              <SignInButton>
                <span>Try it Free</span>
              </SignInButton>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hover:bg-purple-500/10"
            >
              Watch Demo
            </Button>
          </div>

          <div className="relative max-w-3xl mx-auto p-8 rounded-xl border bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-background/80">
              <Search className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                "Find the marketing presentation from last quarter that
                mentioned AI trends..."
              </span>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 font-outfit">
          Everything You Need in One Place
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="PDF Storage"
            description="Store and search through all your PDF documents with ease. Our AI understands the content inside."
          />
          <FeatureCard
            icon={<Image className="w-8 h-8" />}
            title="Image Library"
            description="Organize your images and find them using natural language descriptions."
          />
          <FeatureCard
            icon={<LinkIcon className="w-8 h-8" />}
            title="Link Management"
            description="Save and categorize important links with smart tagging and AI-powered search."
          />
          <FeatureCard
            icon={<Database className="w-8 h-8" />}
            title="Vector Database"
            description="Advanced vector storage ensures lightning-fast semantic search capabilities."
          />
          <FeatureCard
            icon={<Search className="w-8 h-8" />}
            title="AI Search"
            description="Find exactly what you need using natural language queries powered by RAG technology."
          />
          <FeatureCard
            icon={<BrainCog className="w-8 h-8" />}
            title="Smart Organization"
            description="Let AI automatically organize and tag your content for better accessibility."
          />
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-600/10 to-blue-500/10 p-16 overflow-hidden gradient-animate">
          <div className="relative z-10 text-center">
            <h2 className="text-5xl font-bold mb-6 font-outfit">
              Ready to Supercharge Your Knowledge Base?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust BrainBase to manage
              their digital knowledge. Start your free trial today.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 group"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="rounded-full w-12 h-12 bg-gradient-to-r from-purple-500/10 to-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 font-outfit">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
