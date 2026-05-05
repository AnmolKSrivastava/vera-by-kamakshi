const fs = require('fs');
const path = require('path');

const siteUrl = process.env.SITE_URL || process.env.REACT_APP_SITE_URL || 'https://vera-by-kamakshi.web.app';
const today = new Date().toISOString();

const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/collections', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/shipping-policy', priority: '0.5', changefreq: 'monthly' },
  { path: '/return-policy', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms', priority: '0.4', changefreq: 'yearly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/search', priority: '0.5', changefreq: 'weekly' },
  { path: '/wishlist', priority: '0.4', changefreq: 'weekly' },
  { path: '/cart', priority: '0.3', changefreq: 'daily' },
  { path: '/checkout', priority: '0.3', changefreq: 'daily' },
  { path: '/orders', priority: '0.2', changefreq: 'daily' },
  { path: '/profile', priority: '0.2', changefreq: 'monthly' }
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');

console.log(`Sitemap generated at ${sitemapPath}`);