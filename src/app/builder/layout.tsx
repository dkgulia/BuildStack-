import type { Metadata } from 'next';

const SITE_URL = 'https://build-stack-lilac.vercel.app';

export const metadata: Metadata = {
  title: 'PC Builder — Customize Your PC Build with AI Recommendations',
  description:
    'Pick from 5000+ CPUs, GPUs, motherboards, RAM, storage, PSUs, cases, and coolers. AI suggests the best parts, checks compatibility in real-time, and helps you build the perfect custom PC.',
  keywords: [
    'pc builder',
    'custom pc builder',
    'build a pc',
    'pc part picker',
    'gaming pc builder',
    'ai pc builder',
    'pc component selector',
    'customize pc build',
    'pc compatibility checker',
  ],
  alternates: {
    canonical: `${SITE_URL}/builder`,
  },
  openGraph: {
    title: 'PC Builder — Customize Your PC Build | BuildStack',
    description:
      'Select components, check compatibility, get AI recommendations. Build your custom PC from 5000+ parts.',
    url: `${SITE_URL}/builder`,
  },
};

const builderJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BuildStack PC Builder',
  url: `${SITE_URL}/builder`,
  applicationCategory: 'UtilitiesApplication',
  description:
    'Interactive PC builder tool with AI-powered component recommendations, real-time compatibility checking, and side-by-side comparison for custom PC builds.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(builderJsonLd) }}
      />
      {children}
    </>
  );
}
