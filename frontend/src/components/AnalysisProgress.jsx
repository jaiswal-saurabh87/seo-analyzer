function AnalysisProgress({ status }) {
  const getStatusMessage = () => {
    switch (status) {
      case 'queued':
        return 'Queued - waiting to start analysis...';
      case 'processing':
        return 'Processing - analyzing your website...';
      default:
        return 'Analyzing...';
    }
  };

  const getStatusEmoji = () => {
    switch (status) {
      case 'queued':
        return '⏳';
      case 'processing':
        return '🔄';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '3rem' }}>{getStatusEmoji()}</span>
      </div>
      
      <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>
        {getStatusMessage()}
      </h2>

      <div className="spinner"></div>

      <p style={{ marginTop: '1.5rem', color: '#6b7280', fontSize: '0.95rem' }}>
        This may take 30-60 seconds depending on your website's size.
      </p>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
          <strong>What we're doing:</strong>
        </p>
        <ul style={{ textAlign: 'left', fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem' }}>
          <li>Crawling your website</li>
          <li>Analyzing SEO elements</li>
          <li>Checking performance metrics</li>
          <li>Calculating scores</li>
          <li>Generating report</li>
        </ul>
      </div>
    </div>
  );
}

export default AnalysisProgress;
