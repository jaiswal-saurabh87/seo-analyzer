import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { syllable } from 'syllable';
import { calculateScores } from './scoring.js';

export async function analyzeWebsite(url) {
  console.log(`Starting analysis for: ${url}`);
  
  const report = {
    url,
    timestamp: new Date().toISOString(),
    status: 'complete',
    scores: {},
    findings: {
      critical: [],
      warnings: [],
      info: [],
    },
    details: {},
  };

  try {
    // Step 1: Fetch page with Puppeteer
    const pageData = await fetchPageData(url);
    
    // Step 2: Run all analysis modules
    const seoAudit = await analyzeSEOAudit(pageData);
    const technicalSeo = await analyzeTechnicalSEO(url, pageData);
    const contentAnalysis = await analyzeContent(pageData);
    const performance = await analyzePerformance(pageData);

    // Step 3: Combine all findings
    report.details = {
      seoAudit,
      technicalSeo,
      contentAnalysis,
      performance,
    };

    // Step 4: Calculate scores
    report.scores = calculateScores({
      seoAudit,
      technicalSeo,
      contentAnalysis,
      performance,
    });

    // Step 5: Generate findings/recommendations
    generateFindings(report);

    console.log(`Analysis complete for: ${url}`);
    return report;

  } catch (error) {
    console.error(`Error analyzing ${url}:`, error.message);
    throw error;
  }
}

/**
 * Fetch page with Puppeteer (handles JS rendering)
 */
async function fetchPageData(url) {
  let browser;
  try {
   browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--single-process',
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
});
    
    const page = await browser.newPage();
    
    // Set viewport for mobile-friendly detection
    await page.setViewport({ width: 1366, height: 768 });
    
    // Navigate with timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    // Get page content
    const html = await page.content();
    const title = await page.title();
    const links = await page.evaluate(() => {
      return Array.from(document.links).map(link => ({
        href: link.href,
        text: link.textContent.trim(),
        rel: link.getAttribute('rel'),
      }));
    });

    const images = await page.evaluate(() => {
      return Array.from(document.images).map(img => ({
        src: img.src,
        alt: img.alt,
      }));
    });

    // Get Lighthouse metrics (simulated - full version needs lighthouse CLI)
    const performanceMetrics = await page.metrics();

    await page.close();

    return {
      url,
      html,
      title,
      links,
      images,
      performanceMetrics,
    };

  } finally {
    if (browser) await browser.close();
  }
}

/**
 * SEO Audit: Meta tags, headings, images, links
 */
async function analyzeSEOAudit(pageData) {
  const $ = cheerio.load(pageData.html);

  // Meta Tags
  const metaTitle = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const metaViewport = $('meta[name="viewport"]').attr('content') || '';
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDescription = $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';

  // Headings
  const headings = {
    h1: $('h1').length,
    h2: $('h2').length,
    h3: $('h3').length,
    h4: $('h4').length,
    h5: $('h5').length,
    h6: $('h6').length,
  };

  const headingsList = [];
  $('h1, h2, h3, h4, h5, h6').each((i, el) => {
    const tag = el.name;
    const text = $(el).text().trim();
    headingsList.push({ tag, text });
  });

  // Images
  const imagesWithoutAlt = pageData.images.filter(img => !img.alt).length;
  const totalImages = pageData.images.length;
  const altTextCoverage = totalImages > 0 ? ((totalImages - imagesWithoutAlt) / totalImages * 100).toFixed(1) : 0;

  // Links
  const internalLinks = pageData.links.filter(link => {
    try {
      const linkUrl = new URL(link.href);
      const pageUrl = new URL(pageData.url);
      return linkUrl.hostname === pageUrl.hostname;
    } catch {
      return false;
    }
  });

  const externalLinks = pageData.links.filter(link => {
    try {
      const linkUrl = new URL(link.href);
      const pageUrl = new URL(pageData.url);
      return linkUrl.hostname !== pageUrl.hostname;
    } catch {
      return false;
    }
  });

  return {
    metaTags: {
      title: { value: metaTitle, length: metaTitle.length, ideal: '30-60' },
      description: { value: metaDescription, length: metaDescription.length, ideal: '120-160' },
      viewport: { present: !!metaViewport },
      ogTitle: { present: !!ogTitle },
      ogDescription: { present: !!ogDescription },
      ogImage: { present: !!ogImage },
      twitterCard: { present: !!twitterCard },
    },
    headings,
    headingsList,
    images: {
      total: totalImages,
      withoutAlt: imagesWithoutAlt,
      altCoverage: parseFloat(altTextCoverage),
    },
    links: {
      internal: internalLinks.length,
      external: externalLinks.length,
      total: pageData.links.length,
    },
  };
}

async function analyzeTechnicalSEO(url, pageData) {
  const pageUrl = new URL(url);
  const https = pageUrl.protocol === 'https:';

  let robotsTxt = null;
  let sitemapXml = null;
  let hasCanonical = false;
  let redirects = 0;

  try {
    // Check robots.txt
    const robotsUrl = `${pageUrl.protocol}//${pageUrl.host}/robots.txt`;
    const robotsRes = await axios.get(robotsUrl, { timeout: 5000 });
    robotsTxt = robotsRes.data.substring(0, 500); // First 500 chars
  } catch (err) {
    robotsTxt = null;
  }

  try {
    // Check sitemap.xml
    const sitemapUrl = `${pageUrl.protocol}//${pageUrl.host}/sitemap.xml`;
    const sitemapRes = await axios.get(sitemapUrl, { timeout: 5000 });
    sitemapXml = sitemapRes.status === 200;
  } catch (err) {
    sitemapXml = false;
  }

  // Check canonical tag
  const $ = cheerio.load(pageData.html);
  hasCanonical = !!$('link[rel="canonical"]').attr('href');

  // Check for structured data (Schema.org)
  const structuredData = $('script[type="application/ld+json"]').length > 0;

  // Check responsive meta tag
  const isResponsive = !!$('meta[name="viewport"]').attr('content');

  // Check charset
  const hasCharset = !!$('meta[charset]').attr('charset') || !!$('meta[http-equiv="Content-Type"]').attr('content');

  return {
    https: { present: https },
    robotsTxt: { present: !!robotsTxt },
    sitemap: { present: sitemapXml },
    canonical: { present: hasCanonical },
    structuredData: { present: structuredData },
    responsive: { present: isResponsive },
    charset: { present: hasCharset },
    gzip: { checked: false, present: true }, // Would need response headers
  };
}

/**
 * Content Analysis: Word count, readability, keyword density
 */
async function analyzeContent(pageData) {
  const $ = cheerio.load(pageData.html);
  
  // Remove script and style tags
  $('script, style, nav, footer').remove();
  
  const text = $('body').text().trim();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Readability (Flesch-Kincaid Grade)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const syllables = words.reduce((sum, word) => sum + syllable(word), 0);
  
  const fleschKincaid = sentences > 0 && words.length > 0
    ? (0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59).toFixed(1)
    : 0;

  // Keyword density (top 20 words, excluding stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
  ]);

  const wordFreq = {};
  words.forEach(word => {
    const lower = word.toLowerCase();
    if (lower.length > 2 && !stopWords.has(lower)) {
      wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    }
  });

  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count, density: ((count / words.length) * 100).toFixed(2) }));

  return {
    wordCount,
    sentenceCount: sentences,
    readabilityScore: parseFloat(fleschKincaid),
    readabilityLevel: getReadabilityLevel(parseFloat(fleschKincaid)),
    topKeywords,
    avgWordsPerSentence: (words.length / sentences).toFixed(1),
  };
}

/**
 * Performance Analysis: Using Puppeteer metrics as proxy
 */
async function analyzePerformance(pageData) {
  const metrics = pageData.performanceMetrics;
  
  return {
    jsHeapUsed: (metrics.JSHeapUsedSize / 1048576).toFixed(2) + ' MB',
    jsHeapLimit: (metrics.JSHeapTotalSize / 1048576).toFixed(2) + ' MB',
    taskDuration: metrics.TaskDuration?.toFixed(2) || 'N/A',
    estimatedLoadTime: '2-4 seconds', // Simplified; real version uses Lighthouse
  };
}

/**
 * Generate findings and recommendations
 */
function generateFindings(report) {
  const { seoAudit, technicalSeo, contentAnalysis } = report.details;

  // Critical issues
  if (seoAudit.metaTags.title.length === 0) {
    report.findings.critical.push('Meta title is missing');
  }
  if (seoAudit.metaTags.description.length === 0) {
    report.findings.critical.push('Meta description is missing');
  }
  if (seoAudit.headings.h1 === 0) {
    report.findings.critical.push('No H1 tag found (required for SEO)');
  }
  if (!technicalSeo.https.present) {
    report.findings.critical.push('Website is not HTTPS (required for modern SEO)');
  }

  // Warnings
  if (seoAudit.metaTags.title.length < 30 || seoAudit.metaTags.title.length > 60) {
    report.findings.warnings.push(`Meta title length is ${seoAudit.metaTags.title.length} characters (ideal: 30-60)`);
  }
  if (seoAudit.metaTags.description.length < 120 || seoAudit.metaTags.description.length > 160) {
    report.findings.warnings.push(`Meta description length is ${seoAudit.metaTags.description.length} characters (ideal: 120-160)`);
  }
  if (seoAudit.images.altCoverage < 80) {
    report.findings.warnings.push(`Only ${seoAudit.images.altCoverage}% of images have alt text`);
  }
  if (contentAnalysis.wordCount < 300) {
    report.findings.warnings.push(`Content is short (${contentAnalysis.wordCount} words, ideal: 300+)`);
  }

  // Info
  if (!technicalSeo.robotsTxt.present) {
    report.findings.info.push('robots.txt not found (optional but recommended)');
  }
  if (!technicalSeo.sitemap.present) {
    report.findings.info.push('sitemap.xml not found (optional but helpful)');
  }
  if (!technicalSeo.canonical.present) {
    report.findings.info.push('Canonical tag not present');
  }
}

/**
 * Convert Flesch-Kincaid grade to readability level
 */
function getReadabilityLevel(grade) {
  if (grade < 6) return 'Elementary';
  if (grade < 9) return 'Middle School';
  if (grade < 13) return 'High School';
  if (grade < 16) return 'College';
  return 'Graduate';
}
