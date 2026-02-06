import type { Metadata } from 'next';

const SITE_URL = 'https://build-stack-lilac.vercel.app';

export const metadata: Metadata = {
  title: 'Browse 960+ Monitors — IPS, VA, TN, OLED Panels',
  description:
    'Browse and compare 960+ monitors filtered by panel type (IPS, VA, TN, OLED) and brand. Find the perfect monitor for your custom PC build — gaming, editing, or office.',
  keywords: [
    'monitors',
    'gaming monitor',
    'ips monitor',
    'oled monitor',
    'monitor for pc build',
    'best monitor for gaming',
    'monitor comparison',
    '4k monitor',
    '144hz monitor',
  ],
  alternates: {
    canonical: `${SITE_URL}/monitors`,
  },
  openGraph: {
    title: 'Browse 960+ Monitors — Filter by Panel Type | BuildStack',
    description:
      '960+ monitors with IPS, VA, TN, OLED filters. Compare side-by-side and find the best monitor for your PC.',
    url: `${SITE_URL}/monitors`,
  },
};

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'PC Monitors',
  description: 'Browse 960+ monitors for your custom PC build',
  url: `${SITE_URL}/monitors`,
  numberOfItems: 960,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'IPS Monitors' },
    { '@type': 'ListItem', position: 2, name: 'VA Monitors' },
    { '@type': 'ListItem', position: 3, name: 'TN Monitors' },
    { '@type': 'ListItem', position: 4, name: 'OLED Monitors' },
  ],
};

export default function MonitorsLayout({
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
