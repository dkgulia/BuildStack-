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

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
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
            <Link href="#templates" className="hover:text-foreground transition-colors">
              Templates
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
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#templates" className="hover:text-foreground transition-colors">
              Templates
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
