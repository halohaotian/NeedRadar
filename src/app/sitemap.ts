import { MetadataRoute } from 'next';

const DOMAIN = 'https://needradar.10xsmart.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${DOMAIN}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${DOMAIN}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
