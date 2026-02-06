import type { Metadata } from 'next';

const SITE_URL = 'https://build-stack-lilac.vercel.app';

export const metadata: Metadata = {
  title: 'Compare PC Components — Side-by-Side Spec Comparison',
  description:
    'Compare CPUs, GPUs, motherboards, RAM, storage, PSUs, monitors, and laptops side-by-side. See spec differences highlighted, pick the best part for your custom PC build.',
  keywords: [
    'compare pc components',
    'cpu comparison',
    'gpu comparison',
    'compare pc parts',
    'motherboard comparison',
    'ram comparison',
    'pc hardware comparison tool',
    'side by side pc parts',
  ],
  alternates: {
    canonical: `${SITE_URL}/compare`,
  },
  openGraph: {
    title: 'Compare PC Components Side-by-Side | BuildStack',
    description:
      'Full spec-by-spec comparison of CPUs, GPUs, and more. Differences highlighted for easy decision making.',
    url: `${SITE_URL}/compare`,
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
