
import { useEffect } from 'react';

interface SitemapPage {
  url: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastmod?: string;
}

export const useSitemapGenerator = () => {
  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = () => {
    const baseUrl = window.location.origin;
    const currentDate = new Date().toISOString().split('T')[0];

    const pages: SitemapPage[] = [
      {
        url: '/',
        priority: 1.0,
        changefreq: 'daily',
        lastmod: currentDate
      },
      {
        url: '/equipment',
        priority: 0.9,
        changefreq: 'hourly',
        lastmod: currentDate
      },
      {
        url: '/categories',
        priority: 0.8,
        changefreq: 'weekly',
        lastmod: currentDate
      },
      {
        url: '/how-it-works',
        priority: 0.7,
        changefreq: 'monthly',
        lastmod: currentDate
      },
      {
        url: '/pricing',
        priority: 0.7,
        changefreq: 'monthly',
        lastmod: currentDate
      },
      {
        url: '/blog',
        priority: 0.6,
        changefreq: 'weekly',
        lastmod: currentDate
      },
      {
        url: '/list-equipment',
        priority: 0.8,
        changefreq: 'weekly',
        lastmod: currentDate
      },
      {
        url: '/login',
        priority: 0.5,
        changefreq: 'monthly'
      },
      {
        url: '/register',
        priority: 0.5,
        changefreq: 'monthly'
      }
    ];

    const sitemapXml = generateSitemapXML(baseUrl, pages);
    
    // Store sitemap in localStorage for development purposes
    localStorage.setItem('sitemap', sitemapXml);
    console.log('Generated sitemap:', sitemapXml);
  };

  const generateSitemapXML = (baseUrl: string, pages: SitemapPage[]): string => {
    const urls = pages.map(page => `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <priority>${page.priority}</priority>
      <changefreq>${page.changefreq}</changefreq>
      ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
  };
};

const SitemapGenerator = () => {
  useSitemapGenerator();
  return null;
};

export default SitemapGenerator;
