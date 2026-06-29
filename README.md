# SEO Analyzer
A free, open-source SEO analysis tool that crawls your website and provides detailed SEO metrics, technical analysis, content quality scoring, and performance insights.

## Features

### SEO Audit
- Meta title & description analysis
- Heading structure validation (H1-H6)
- Image alt text coverage
- URL structure analysis
- Internal & external links analysis

### Technical SEO
- HTTPS/SSL detection
- robots.txt scanning
- sitemap.xml detection
- Mobile-friendly detection
- Canonical tag analysis
- Structured data detection
- Charset validation

### Content Analysis
- Word count & readability
- Keyword frequency analysis
- Sentence complexity metrics
- Content depth assessment

### Performance
- Page load metrics
- Core Web Vitals estimates
- Resource utilization

### Scoring System
- **Technical SEO Score** (25%) - Infrastructure & crawlability
- **On-Page SEO Score** (35%) - Content optimization
- **Content Quality Score** (20%) - Depth & readability
- **Performance Score** (20%) - Speed & responsiveness
- **Overall Score** (0-100) - Composite metric

## Technologies Used

**Backend:**
- Node.js + Express.js
- Puppeteer (web crawling & automation)
- Cheerio (DOM parsing)
- Axios (HTTP requests)

**Frontend:**
- React 18
- Vite (build tool)
- CSS3 (responsive design)

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/jaiswal-saurabh87/seo-analayzer
   cd seo-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. **Build frontend**
   ```bash
   npm run build:frontend
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
npm run build:frontend
npm start
```

## API Documentation

### Analyze Website
```http
POST /api/analyze
Content-Type: application/json

{
  "url": "https://example.com"
}

Response:
{
  "jobId": "uuid",
  "status": "queued",
  "message": "Analysis started"
}
```

### Get Results
```http
GET /api/results/:jobId

Response (processing):
{
  "jobId": "uuid",
  "status": "processing",
  "progress": 45
}

Response (complete):
{
  "jobId": "uuid",
  "status": "complete",
  "report": {
    "url": "https://example.com",
    "scores": {
      "overall": 75,
      "technical": 85,
      "onPage": 68,
      "performance": 60,
      "content": 75
    },
    "findings": {
      "critical": [...],
      "warnings": [...],
      "info": [...]
    },
    "details": {
      "seoAudit": {...},
      "technicalSeo": {...},
      "contentAnalysis": {...},
      "performance": {...}
    }
  }
}
```

### Health Check
```http
GET /api/health

Response:
{
  "status": "ok",
  "activeJobs": 1,
  "queuedJobs": 3
}
```

## Scoring Logic

### Technical SEO Score
- HTTPS (20 pts) - Is the site secure?
- Robots.txt (15 pts) - Is crawling properly configured?
- Sitemap (15 pts) - Is site structure discoverable?
- Canonical tags (10 pts) - Is duplication avoided?
- Structured data (15 pts) - Is rich data marked up?
- Mobile responsive (15 pts) - Does it work on mobile?
- Charset (10 pts) - Is encoding declared?

### On-Page SEO Score
- Meta title (20 pts) - Is it present and optimal length (30-60 chars)?
- Meta description (20 pts) - Is it present and optimal length (120-160)?
- H1 tags (15 pts) - Exactly one H1 present?
- Heading hierarchy (15 pts) - Do headings follow proper structure?
- Internal links (10 pts) - At least 3 internal links?
- Image alt text (10 pts) - 80%+ of images have alt text?
- Social metadata (10 pts) - OG and Twitter tags present?

### Content Quality Score
- Word count (30 pts) - 600+ words ideal
- Readability (25 pts) - Grade 6-9 is ideal
- Keyword distribution (20 pts) - No over-optimization (<3% density)
- Content depth (15 pts) - Multiple paragraphs and topics
- Structure (10 pts) - Logical organization

### Performance Score
- Lighthouse score (50 pts) - 90+ is excellent
- LCP (20 pts) - <2.5s is good
- CLS (15 pts) - <0.1 is excellent
- FID (15 pts) - <100ms is good

## Limitations

- No real Lighthouse integration (uses simulated scores)
- No database persistence (results stored in memory)
- Single server instance (no clustering)
- Max 2 concurrent analyses (configurable)
- 30-60 second analysis time per URL

### Production Improvements Needed

1. **Replace in-memory storage with database**
   ```javascript
   // Add PostgreSQL or MongoDB
   import { MongoClient } from 'mongodb';
   ```

2. **Add real Lighthouse integration**
   ```javascript
   import lighthouse from 'lighthouse';
   ```

3. **Implement result caching**
   ```javascript
   // Cache results for 30 days
   // Return cached result if URL analyzed recently
   ```

4. **Add rate limiting**
   ```javascript
   import rateLimit from 'express-rate-limit';
   ```

5. **Add authentication** (if needed)
   ```javascript
   // JWT tokens, API keys
   ```

## Contributing

Contributions welcome! Please submit pull requests.

## Support

For issues and questions, please use GitHub Issues.

---

**Built with ❤️ by Saurabh Jaiswal**
<br>
Last updated: June 2026