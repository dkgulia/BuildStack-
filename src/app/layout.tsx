import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'PC Builder - Build Your Dream PC',
  description:
    'Build your perfect PC with real-time compatibility checking. Select components, check compatibility, and share your build.',
  openGraph: {
    title: 'Build Stack - Modern Web Development Platform',
    description:
      'Build Stack offers a streamlined platform for modern web development and deployment. Create, collaborate, and deploy your projects efficiently with our tools.',
    url: 'https://build-stack-lilac.vercel.app/',
    type: 'website',
    siteName: 'BuildStack',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
