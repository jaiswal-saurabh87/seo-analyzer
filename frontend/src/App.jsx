import { useState } from 'react';
import axios from 'axios';
import './App.css';
import UrlInput from './components/UrlInput';
import AnalysisProgress from './components/AnalysisProgress';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [jobId, setJobId] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (url) => {
    setError(null);
    setLoading(true);

    try {
      // Start analysis
      const response = await axios.post('/api/analyze', { url });
      const id = response.data.jobId;
      setJobId(id);
      setAnalysisStatus('queued');

      // Poll for results
      pollResults(id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start analysis');
      setLoading(false);
    }
  };

  const pollResults = (id) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/results/${id}`);
        const { status, report, progress } = response.data;

        setAnalysisStatus(status);

        if (status === 'complete') {
          setResults(report);
          setLoading(false);
          clearInterval(pollInterval);
        } else if (status === 'error') {
          setError(report?.error || 'Analysis failed');
          setLoading(false);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 1000);
  };

  const handleReset = () => {
    setJobId(null);
    setAnalysisStatus(null);
    setResults(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>SEO Analyzer</h1>
          <p>Analyze your website's SEO performance in seconds</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {error && (
            <div className="error-box">
              <span>❌ {error}</span>
              <button onClick={handleReset} className="btn-small">
                Try Again
              </button>
            </div>
          )}

          {!results && !loading && (
            <UrlInput onAnalyze={handleAnalyze} />
          )}

          {loading && analysisStatus && (
            <AnalysisProgress status={analysisStatus} />
          )}

          {results && (
            <>
              <ResultsDisplay report={results} />
              <button onClick={handleReset} className="btn-primary btn-large">
                Analyze Another Website
              </button>
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>
          SEO Analyzer • Built with ❤️by Saurabh Jaiswal • 2026 <br/>
          <a href="https://github.com/jaiswal-saurabh87/seo-analyzer">View on GitHub</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
