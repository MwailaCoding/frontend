#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for Sera's Kitchen
 * Run this script during build to generate an up-to-date sitemap
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DOMAIN = 'https://your-domain.vercel.app'; // Update this with your actual domain
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

// Static routes with their priorities and change frequencies
const STATIC_ROUTES = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    path: '/products',
    priority: '0.9',
    changefreq: 'daily',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    path: '/products/cakes',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    path: '/products/kenyan-food',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    path: '/products/main-dishes',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    path: '/products/traditional',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    path: '/products/specials',
    priority: '0.8',
    changefreq: 'daily',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    path: '/products/drinks',
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    path: '/privacy-policy',
    priority: '0.3',
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    path: '/terms-of-service',
    priority: '0.3',
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0]
  }
];

// Generate XML sitemap
function generateSitemap() {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urls = STATIC_ROUTES.map(route => {
    return `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');
  
  const sitemap = `${xmlHeader}
${urlsetOpen}
${urls}
${urlsetClose}`;
  
  return sitemap;
}

// Write sitemap to file
function writeSitemap() {
  try {
    const sitemap = generateSitemap();
    fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf8');
    console.log(`✅ Sitemap generated successfully at: ${OUTPUT_FILE}`);
    console.log(`🌐 Domain: ${DOMAIN}`);
    console.log(`📄 Total URLs: ${STATIC_ROUTES.length}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  console.log('🚀 Generating sitemap for Sera\'s Kitchen...');
  writeSitemap();
}

module.exports = { generateSitemap, writeSitemap };
