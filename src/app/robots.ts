import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://build-stack-lilac.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/builder/review'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
