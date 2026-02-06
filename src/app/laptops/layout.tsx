import type { Metadata } from 'next';

const SITE_URL = 'https://build-stack-lilac.vercel.app';

export const metadata: Metadata = {
  title: 'Browse 1600+ Laptops — New & Refurbished',
  description:
    'Browse and compare 1600+ laptops from top brands. Filter by brand, condition (new or refurbished), and compare specs side-by-side to find the best laptop for your needs.',
  keywords: [
    'laptops',
    'buy laptop',
    'gaming laptop',
    'refurbished laptop',
    'laptop comparison',
    'best laptop for coding',
    'laptop for video editing',
    'budget laptop',
  ],
  alternates: {
    canonical: `${SITE_URL}/laptops`,
  },
  openGraph: {
    title: 'Browse 1600+ Laptops — New & Refurbished | BuildStack',
    description:
      '1600+ laptops with brand and condition filters. Compare side-by-side to find the best laptop.',
    url: `${SITE_URL}/laptops`,
  },
};

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Laptops',
  description: 'Browse 1600+ new and refurbished laptops',
  url: `${SITE_URL}/laptops`,
  numberOfItems: 1600,
};

export default function LaptopsLayout({
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
