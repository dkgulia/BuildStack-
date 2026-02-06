import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const SITE_URL = 'https://build-stack-lilac.vercel.app';
const SITE_NAME = 'BuildStack';
const DEFAULT_DESCRIPTION =
  'Build your perfect custom PC with AI-powered recommendations, real-time compatibility checks, and 5000+ components. The smartest PC builder tool for gaming, editing, coding, and office builds.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'BuildStack — AI PC Builder | Customize Your Dream PC Build',
    template: '%s | BuildStack',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'pc builder',
    'ai pc builder',
    'customize pc build',
    'build custom pc',
    'pc part picker',
    'custom pc builder',
    'gaming pc builder',
    'pc component compatibility checker',
    'build a pc online',
    'pc build configurator',
    'ai powered pc builder',
    'pc parts compatibility',
    'custom gaming pc',
    'budget pc build',
    'pc builder tool',
    'online pc builder',
    'build your own pc',
    'pc hardware configurator',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'BuildStack — AI PC Builder | Customize Your Dream PC Build',
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuildStack — AI PC Builder | Customize Your Dream PC Build',
    description: DEFAULT_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: 'technology',
};

// JSON-LD WebSite schema for sitelinks search box
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/builder?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// JSON-LD Organization schema
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
