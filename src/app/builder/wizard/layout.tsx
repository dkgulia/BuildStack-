import type { Metadata } from 'next';

const SITE_URL = 'https://build-stack-lilac.vercel.app';

export const metadata: Metadata = {
  title: 'Guided PC Build Wizard — AI Builds Your Perfect PC in 4 Steps',
  description:
    'Not sure where to start? Our guided wizard asks your use case, platform preference, and budget — then AI generates an optimized custom PC build for gaming, editing, coding, or office use.',
  keywords: [
    'pc build wizard',
    'guided pc builder',
    'ai pc build generator',
    'build a pc for beginners',
    'auto pc builder',
    'pc builder for gaming',
    'budget pc build generator',
    'best pc build for editing',
  ],
  alternates: {
    canonical: `${SITE_URL}/builder/wizard`,
  },
  openGraph: {
    title: 'Guided PC Build Wizard — AI Builds Your Perfect PC | BuildStack',
    description:
      '4-step wizard: pick use case, platform, budget — AI generates a fully compatible custom PC build.',
    url: `${SITE_URL}/builder/wizard`,
  },
};

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Build a Custom PC with BuildStack Wizard',
  description:
    'Use the BuildStack guided wizard to build a custom PC in 4 easy steps with AI recommendations.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Choose Your Use Case',
      text: 'Select what you will use your PC for: Gaming, Video Editing, Coding/Dev, or Office.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Pick Your Platform',
      text: 'Choose between AMD, Intel, or no preference for your CPU platform.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Set Your Budget',
      text: 'Set a budget from 40K to 2.5L INR, or skip for no budget limit.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Get Your AI-Generated Build',
      text: 'AI generates an optimized PC build with compatible parts. Customize further in the builder.',
    },
  ],
};

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      {children}
    </>
  );
}
