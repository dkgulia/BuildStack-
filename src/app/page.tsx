import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroSection } from '@/components/HeroSection';
import {
  HowItWorks,
  Features,
  UseCaseBuilds,
  CompatibilityTrust,
  Comparison,
  FinalCTA,
} from '@/components/sections';

const SITE_URL = 'https://build-stack-lilac.vercel.app';

export const metadata: Metadata = {
  title: 'BuildStack — AI PC Builder | Build & Customize Your Dream PC Online',
  description:
    'Build your perfect custom PC with AI-powered recommendations. Pick from 5000+ components, get real-time compatibility checks, and customize gaming, editing, coding or office builds — all free, no signup required.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'BuildStack — AI PC Builder | Build & Customize Your Dream PC Online',
    description:
      'The smartest PC builder tool. AI picks, compatibility checks, 5000+ parts, guided wizard. Build your custom PC in minutes.',
    url: SITE_URL,
  },
};

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BuildStack',
  url: SITE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  description:
    'AI-powered PC builder tool with real-time compatibility checking, guided wizard, and 5000+ components for custom gaming, editing, and office PC builds.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  featureList: [
    'AI-powered component recommendations',
    'Real-time compatibility checking',
    'Guided PC build wizard',
    '5000+ PC components database',
    'Side-by-side component comparison',
    'Pre-built templates for gaming, editing, coding',
    'Shareable build links',
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is BuildStack PC Builder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BuildStack is a free AI-powered PC builder tool that helps you customize and build your dream PC. It checks component compatibility in real-time, offers AI recommendations, and lets you choose from 5000+ parts for gaming, video editing, coding, and office builds.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI PC builder work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The AI PC builder uses DeepSeek AI to analyze your selected components and suggest the best compatible parts. You can also use the guided wizard — pick your use case, platform preference, and budget, and AI generates an optimized full build.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I customize a PC build for gaming?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. BuildStack has 120+ pre-built gaming templates and a guided wizard that optimizes for high FPS. Pick Gaming as your use case, set your budget, and get an AI-generated build with the best GPU, CPU, and RAM for your needs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the PC builder free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, BuildStack is completely free. No signup required. Build your PC, share the link, and compare components — all without creating an account.',
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            BuildStack
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/presets" className="hover:text-foreground transition-colors">
              Templates
            </Link>
            <Link href="/monitors" className="hover:text-foreground transition-colors">
              Monitors
            </Link>
            <Link href="/laptops" className="hover:text-foreground transition-colors">
              Laptops
            </Link>
          </nav>
          <Link
            href="/builder"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Open Builder
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <HeroSection />

        {/* How It Works */}
        <HowItWorks />

        {/* Features */}
        <div id="features">
          <Features />
        </div>

        {/* Use Case Builds */}
        <div id="templates">
          <UseCaseBuilds />
        </div>

        {/* Compatibility Trust */}
        <CompatibilityTrust />

        {/* Comparison */}
        <Comparison />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            BuildStack — PC Builder Tool
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/builder" className="hover:text-foreground transition-colors">
              Builder
            </Link>
            <Link href="/presets" className="hover:text-foreground transition-colors">
              Templates
            </Link>
            <Link href="/monitors" className="hover:text-foreground transition-colors">
              Monitors
            </Link>
            <Link href="/laptops" className="hover:text-foreground transition-colors">
              Laptops
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
