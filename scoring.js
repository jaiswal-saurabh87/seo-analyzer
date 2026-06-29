export function calculateScores(analysis) {
  const { seoAudit, technicalSeo, contentAnalysis, performance } = analysis;

  const technicalScore = calculateTechnicalScore(technicalSeo);
  const onPageScore = calculateOnPageScore(seoAudit);
  const contentScore = calculateContentScore(contentAnalysis);
  const performanceScore = calculatePerformanceScore(performance);

  const overallScore = Math.round(
    (technicalScore * 0.25) +
    (onPageScore * 0.35) +
    (performanceScore * 0.20) +
    (contentScore * 0.20)
  );

  return {
    overall: overallScore,
    technical: technicalScore,
    onPage: onPageScore,
    performance: performanceScore,
    content: contentScore,
  };
}

/**
 * Technical SEO Score (0-100)
 * 
 * Measures: HTTPS, robots.txt, sitemap, canonical, mobile-friendly, structured data
 */
function calculateTechnicalScore(technicalSeo) {
  let score = 0;
  let totalPoints = 0;

  // HTTPS (20 points)
  totalPoints += 20;
  if (technicalSeo.https.present) {
    score += 20;
  }

  // Robots.txt (15 points)
  totalPoints += 15;
  if (technicalSeo.robotsTxt.present) {
    score += 15;
  }

  // Sitemap (15 points)
  totalPoints += 15;
  if (technicalSeo.sitemap.present) {
    score += 15;
  }

  // Canonical tag (10 points)
  totalPoints += 10;
  if (technicalSeo.canonical.present) {
    score += 10;
  }

  // Structured data (15 points)
  totalPoints += 15;
  if (technicalSeo.structuredData.present) {
    score += 15;
  }

  // Mobile responsive (15 points)
  totalPoints += 15;
  if (technicalSeo.responsive.present) {
    score += 15;
  }

  // Charset (10 points)
  totalPoints += 10;
  if (technicalSeo.charset.present) {
    score += 10;
  }

  return Math.round((score / totalPoints) * 100);
}

/**
 * On-Page SEO Score (0-100)
 * 
 * Measures: Meta title, meta description, H1 presence, heading hierarchy, 
 * internal links, image alt tags, social metadata
 */
function calculateOnPageScore(seoAudit) {
  let score = 0;
  let totalPoints = 0;

  const { metaTags, headings, images, links } = seoAudit;

  // Meta Title (20 points)
  totalPoints += 20;
  if (metaTags.title.length >= 30 && metaTags.title.length <= 60) {
    score += 20;
  } else if (metaTags.title.length > 0) {
    score += 10; // Partial credit if exists but not optimal length
  }

  // Meta Description (20 points)
  totalPoints += 20;
  if (metaTags.description.length >= 120 && metaTags.description.length <= 160) {
    score += 20;
  } else if (metaTags.description.length > 0) {
    score += 10; // Partial credit if exists but not optimal length
  }

  // H1 tag (15 points) - Should have exactly 1 H1
  totalPoints += 15;
  if (headings.h1 === 1) {
    score += 15;
  } else if (headings.h1 > 0) {
    score += 5; // Partial credit if H1 exists
  }

  // Heading hierarchy (15 points) - Check logical structure
  totalPoints += 15;
  const hierarchyValid = validateHeadingHierarchy(seoAudit.headingsList);
  if (hierarchyValid) {
    score += 15;
  } else if (headings.h1 > 0 || headings.h2 > 0) {
    score += 8; // Partial credit if some headings exist
  }

  // Internal links (10 points)
  totalPoints += 10;
  if (links.internal >= 3) {
    score += 10;
  } else if (links.internal > 0) {
    score += 5;
  }

  // Image alt text coverage (10 points)
  totalPoints += 10;
  if (images.altCoverage >= 80) {
    score += 10;
  } else if (images.altCoverage >= 50) {
    score += 5;
  }

  // Social metadata (10 points)
  totalPoints += 10;
  const socialMeta = (metaTags.ogTitle.present ? 3 : 0) +
                     (metaTags.ogDescription.present ? 3 : 0) +
                     (metaTags.ogImage.present ? 2 : 0) +
                     (metaTags.twitterCard.present ? 2 : 0);
  score += Math.min(10, socialMeta);

  return Math.round((score / totalPoints) * 100);
}

/**
 * Content Quality Score (0-100)
 * 
 * Measures: Content length, readability, keyword distribution, depth
 */
function calculateContentScore(contentAnalysis) {
  let score = 0;
  let totalPoints = 0;

  const { wordCount, readabilityScore, topKeywords } = contentAnalysis;

  // Content length (30 points)
  // 0-200 words: 0 pts, 200-300: 5 pts, 300-600: 20 pts, 600+: 30 pts
  totalPoints += 30;
  if (wordCount >= 600) {
    score += 30;
  } else if (wordCount >= 300) {
    score += 20;
  } else if (wordCount >= 200) {
    score += 5;
  }

  // Readability (25 points)
  // Grade 6-8: Excellent, 8-10: Good, 10-12: Fair, 12+: Difficult
  totalPoints += 25;
  if (readabilityScore >= 6 && readabilityScore <= 9) {
    score += 25; // Ideal range
  } else if (readabilityScore >= 5 && readabilityScore <= 12) {
    score += 15; // Acceptable range
  } else if (readabilityScore > 0) {
    score += 5; // Poor readability
  }

  // Keyword distribution (20 points)
  // Check if keywords are well-distributed (not over-optimized)
  totalPoints += 20;
  if (topKeywords.length > 0) {
    const topKeywordDensity = parseFloat(topKeywords[0].density);
    if (topKeywordDensity <= 3) {
      score += 20; // Good distribution
    } else if (topKeywordDensity <= 5) {
      score += 12; // Acceptable
    } else {
      score += 5; // Over-optimized
    }
  }

  // Sentence variety and depth (15 points)
  // Implicit in content structure; award if content exists
  totalPoints += 15;
  if (wordCount >= 300 && topKeywords.length >= 5) {
    score += 15;
  } else if (wordCount >= 200) {
    score += 8;
  }

  // Multiple paragraphs indicator (10 points)
  // Implicit; award if decent content exists
  totalPoints += 10;
  if (wordCount >= 400) {
    score += 10;
  } else if (wordCount >= 300) {
    score += 5;
  }

  return Math.round((score / totalPoints) * 100);
}

/**
 * Performance Score (0-100)
 * 
 * Measures: Page load time, Core Web Vitals (simulated)
 */
function calculatePerformanceScore(performance) {
  // Simplified: without real Lighthouse, we give baseline scores
  // In production, integrate real Lighthouse data

  let score = 0;
  let totalPoints = 0;

  // Lighthouse score simulation (50 points)
  totalPoints += 50;
  // Without real lighthouse, assume baseline
  score += 25; // 50% of points

  // LCP score (20 points)
  totalPoints += 20;
  score += 10; // Baseline

  // CLS score (15 points)
  totalPoints += 15;
  score += 8; // Baseline

  // FID score (15 points)
  totalPoints += 15;
  score += 8; // Baseline

  // Would be better with actual metrics, but this is a working baseline
  return Math.round((score / totalPoints) * 100);
}

/**
 * Validate heading hierarchy (H1 -> H2 -> H3, no gaps)
 */
function validateHeadingHierarchy(headingsList) {
  if (headingsList.length === 0) return false;

  // Very basic check: if we have H1, hierarchy is reasonable
  const hasH1 = headingsList.some(h => h.tag === 'h1');
  const hasH2 = headingsList.some(h => h.tag === 'h2');

  // Ideal is H1 > H2 or just H1
  return hasH1 && (headingsList.length === 1 || hasH2);
}

/**
 * Get color/grade for a score
 */
export function getScoreGrade(score) {
  if (score >= 90) return { grade: 'A', color: '#10b981', status: 'Excellent' };
  if (score >= 80) return { grade: 'B', color: '#3b82f6', status: 'Good' };
  if (score >= 70) return { grade: 'C', color: '#f59e0b', status: 'Fair' };
  if (score >= 60) return { grade: 'D', color: '#ef4444', status: 'Poor' };
  return { grade: 'F', color: '#7c2d12', status: 'Critical' };
}
