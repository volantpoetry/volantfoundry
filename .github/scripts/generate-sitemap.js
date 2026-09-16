/**
 * Auto Sitemap Generator for Volant Foundry (single-page)
 * ONLY includes URLs from volantfoundry.vercel.app
 */

const fs = require('fs');
const path = require('path');

const domain = 'https://volantfoundry.vercel.app';
const publicFolder = './';

// Single static page
const allowedPages = [
  'index.html'
];

// No external URLs
const externalUrls = [];

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getUrlWithHtml(filePath) {
  let cleanPath = filePath.replace(/^\.\//, '');
  if (cleanPath === 'index.html') return '';
  if (cleanPath.endsWith('/index.html')) return cleanPath.replace(/\/index\.html$/, '/');
  return cleanPath;
}

function buildXML(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls.map(u => `
  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod)}</lastmod>
    <changefreq>${escapeXml(u.changefreq)}</changefreq>
    <priority>${escapeXml(u.priority)}</priority>
  </url>
`).join('')}

</urlset>`;
}

function generateRobotsTxt() {
  const robots = `# Robots.txt for Volant Foundry
User-agent: *
Allow: /

# Block non-HTML files
Disallow: /*.js$
Disallow: /*.css$
Disallow: /*.json$
Disallow: /*.xml$

# Block node_modules
Disallow: /node_modules/

# Block images
Disallow: /images/

Sitemap: ${domain}/sitemap.xml`;

  fs.writeFileSync(path.join(publicFolder, 'robots.txt'), robots, 'utf8');
  console.log('✅ robots.txt generated');
}

async function generateSitemap() {
  try {
    console.log("🧠 Generating SEO sitemap for Volant Foundry...");
    console.log(`📁 Domain: ${domain}`);

    const staticResults = [];
    for (const page of allowedPages) {
      const fullPath = path.join(publicFolder, page);
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ Warning: ${page} not found, skipping...`);
        continue;
      }

      const stats = fs.statSync(fullPath);
      const urlPath = getUrlWithHtml(page);
      const url = urlPath === '' ? domain : `${domain}/${urlPath}`;

      // Single page = 1.0
      const priority = '1.0';

      staticResults.push({
        loc: url,
        lastmod: stats.mtime.toISOString(),
        changefreq: 'weekly',
        priority: priority
      });
    }

    console.log(`✅ ${staticResults.length} static page(s) generated`);

    const allUrls = [...staticResults];

    const xml = buildXML(allUrls);
    fs.writeFileSync(path.join(publicFolder, 'sitemap.xml'), xml, 'utf8');
    console.log('✅ sitemap.xml generated');

    console.log('\n📋 URLs:');
    allUrls.forEach(u => console.log(`   - ${u.loc} (priority: ${u.priority})`));

    generateRobotsTxt();

    console.log('\n📊 Sitemap Statistics:');
    console.log(`   Total URLs: ${allUrls.length}`);

  } catch (err) {
    console.error('❌ Sitemap error:', err);
    process.exit(1);
  }
}

generateSitemap();
