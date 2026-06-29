import { useState } from 'react';

function UrlInput({ onAnalyze }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      // Add protocol if missing
      let urlToAnalyze = url.trim();
      if (!urlToAnalyze.startsWith('http')) {
        urlToAnalyze = 'https://' + urlToAnalyze;
      }
      new URL(urlToAnalyze);
      onAnalyze(urlToAnalyze);
    } catch (err) {
      setError('Please enter a valid URL');
    }
  };

  return (
    <div className="card">
      <h2>Analyze Your Website</h2>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>
        Enter your website URL to get a comprehensive SEO report
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url">Website URL</label>
          <input
            id="url"
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            onFocus={() => setError('')}
          />
          {error && <span style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          Analyze Now
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', fontSize: '0.875rem', color: '#0369a1' }}>
        <strong>Tip:</strong> Analysis typically takes 30-60 seconds. Please be patient while we crawl and analyze your site.
      </div>
    </div>
  );
}

export default UrlInput;
