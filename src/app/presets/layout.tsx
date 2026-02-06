import type { Metadata } from 'next';

const SITE_URL = 'https://build-stack-lilac.vercel.app';

export const metadata: Metadata = {
  title: 'PC Build Templates — 120+ Pre-Built Configs for Gaming, Editing & More',
  description:
    'Browse 120+ pre-built PC configurations for gaming, video editing, coding, and office use. Pick a template, customize it in the builder, and get a compatible build instantly.',
  keywords: [
    'pc build templates',
    'prebuilt pc configs',
    'gaming pc template',
    'pc build presets',
    'best gaming pc build',
    'video editing pc build',
    'coding pc setup',
    'office pc build',
    'pre configured pc builds',
  ],
  alternates: {
    canonical: `${SITE_URL}/presets`,
  },
  openGraph: {
    title: '120+ PC Build Templates — Gaming, Editing, Coding | BuildStack',
    description:
      'Pre-built PC configurations optimized for gaming, editing, coding, and office. One-click customize in the builder.',
    url: `${SITE_URL}/presets`,
  },
};

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'PC Build Templates',
  description: '120+ pre-built PC configurations for different use cases',
  url: `${SITE_URL}/presets`,
  numberOfItems: 122,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Gaming PC Builds' },
    { '@type': 'ListItem', position: 2, name: 'Video Editing PC Builds' },
    { '@type': 'ListItem', position: 3, name: 'Coding/Dev PC Builds' },
    { '@type': 'ListItem', position: 4, name: 'Office PC Builds' },
  ],
};

export default function PresetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {children}
    </>
  );
}
