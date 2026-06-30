import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { analyzeWebsite } from './analyzer.js';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for jobs and results
const jobQueue = new Map();
const results = new Map();
let activeJobs = 0;
const MAX_CONCURRENT_JOBS = 2;

// Serve static frontend files
app.use(express.static('frontend/dist'));

// ==================== API ENDPOINTS ====================

/**
 * POST /api/analyze
 * Start a new SEO analysis
 */
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const jobId = uuidv4();
  
  jobQueue.set(jobId, {
    id: jobId,
    url,
    status: 'queued',
    progress: 0,
    createdAt: new Date(),
  });

  // Start processing if slots available
  processQueue();

  res.json({
    jobId,
    status: 'queued',
    message: 'Analysis started, please check back for results',
  });
});

/**
 * GET /api/results/:id
 * Get analysis results for a job
 */
app.get('/api/results/:id', (req, res) => {
  const { id } = req.params;
  const job = jobQueue.get(id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status === 'complete') {
    return res.json({
      jobId: id,
      status: 'complete',
      report: results.get(id),
    });
  }

  res.json({
    jobId: id,
    status: job.status,
    progress: job.progress,
    message: job.status === 'processing' ? 'Analyzing website...' : 'Queued',
  });
});

// ==================== JOB PROCESSING ====================

async function processQueue() {
  // Skip if already processing at max capacity
  if (activeJobs >= MAX_CONCURRENT_JOBS) {
    return;
  }

  // Find next queued job
  let nextJob = null;
  for (const [id, job] of jobQueue.entries()) {
    if (job.status === 'queued') {
      nextJob = { id, ...job };
      break;
    }
  }

  if (!nextJob) {
    return;
  }

  // Start processing
  activeJobs++;
  const job = jobQueue.get(nextJob.id);
  job.status = 'processing';
  job.startedAt = new Date();

  try {
    // Run analysis
    const report = await analyzeWebsite(nextJob.url);
    
    // Store results
    results.set(nextJob.id, report);
    job.status = 'complete';
    job.progress = 100;
    job.completedAt = new Date();
  } catch (error) {
    console.error(`Error analyzing ${nextJob.url}:`, error.message);
    job.status = 'error';
    job.error = error.message;
    results.set(nextJob.id, {
      error: error.message,
      url: nextJob.url,
    });
  } finally {
    activeJobs--;
    // Process next job if queue has items
    processQueue();
  }
}

// Process queue every 1 second
setInterval(processQueue, 1000);

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    activeJobs,
    queuedJobs: Array.from(jobQueue.values()).filter(j => j.status === 'queued').length,
  });
});

// ==================== FRONTEND FALLBACK ====================

app.get('*', (req, res) => {
  res.sendFile(new URL('./frontend/dist/index.html', import.meta.url).pathname);
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SEO Analyzer running on http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
});
