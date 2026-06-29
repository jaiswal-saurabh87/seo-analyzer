import { useState } from 'react';

function ResultsDisplay({ report }) {
  const [expandedSections, setExpandedSections] = useState({
    seo: true,
    technical: true,
    content: true,
    performance: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const ScoreCard = ({ title, score }) => (
    <div className="score-card">
      <h3>{title}</h3>
      <div className="score-value" style={{ color: getScoreColor(score) }}>
        {score}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#666' }}>
        Grade: <strong>{getScoreGrade(score)}</strong>
      </div>
      <div className="score-bar">
        <div 
          className="score-bar-fill" 
          style={{ 
            width: `${score}%`, 
            backgroundColor: getScoreColor(score) 
          }}
        ></div>
      </div>
    </div>
  );

  const SectionContent = ({ section, expanded }) => {
    if (!expanded) return null;

    switch (section) {
      case 'seo':
        return (
          <div style={{ marginTop: '1rem' }}>
            {report.details?.seoAudit && (
              <>
                <div className="detail-item">
                  <span className="detail-label">Meta Title</span>
                  <span className="detail-value">
                    {report.details.seoAudit.metaTags.title.value || '(Not found)'}
                    <br />
                    <small>Length: {report.details.seoAudit.metaTags.title.length} (Ideal: 30-60)</small>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Meta Description</span>
                  <span className="detail-value">
                    {report.details.seoAudit.metaTags.description.value || '(Not found)'}
                    <br />
                    <small>Length: {report.details.seoAudit.metaTags.description.length} (Ideal: 120-160)</small>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">H1 Tags</span>
                  <span className="detail-value">{report.details.seoAudit.headings.h1} found</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Internal Links</span>
                  <span className="detail-value">{report.details.seoAudit.links.internal}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">External Links</span>
                  <span className="detail-value">{report.details.seoAudit.links.external}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Image Alt Text Coverage</span>
                  <span className="detail-value">{report.details.seoAudit.images.altCoverage}%</span>
                </div>
              </>
            )}
          </div>
        );

      case 'technical':
        return (
          <div style={{ marginTop: '1rem' }}>
            {report.details?.technicalSeo && (
              <>
                <div className="detail-item">
                  <span className="detail-label">HTTPS</span>
                  <span className="detail-value">
                    {report.details.technicalSeo.https.present ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Robots.txt</span>
                  <span className="detail-value">
                    {report.details.technicalSeo.robotsTxt.present ? 'Found' : 'Not found'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sitemap.xml</span>
                  <span className="detail-value">
                    {report.details.technicalSeo.sitemap.present ? 'Found' : 'Not found'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Canonical Tag</span>
                  <span className="detail-value">
                    {report.details.technicalSeo.canonical.present ? 'Present' : 'Not present'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Structured Data</span>
                  <span className="detail-value">
                    {report.details.technicalSeo.structuredData.present ? 'Detected' : 'Not found'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mobile Responsive</span>
                  <span className="detail-value">
                    {report.details.technicalSeo.responsive.present ? 'Yes' : 'No'}
                  </span>
                </div>
              </>
            )}
          </div>
        );

      case 'content':
        return (
          <div style={{ marginTop: '1rem' }}>
            {report.details?.contentAnalysis && (
              <>
                <div className="detail-item">
                  <span className="detail-label">Word Count</span>
                  <span className="detail-value">{report.details.contentAnalysis.wordCount} words</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sentence Count</span>
                  <span className="detail-value">{report.details.contentAnalysis.sentenceCount} sentences</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Readability Score</span>
                  <span className="detail-value">
                    {report.details.contentAnalysis.readabilityScore} 
                    ({report.details.contentAnalysis.readabilityLevel})
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Top Keywords</span>
                  <span className="detail-value">
                    {report.details.contentAnalysis.topKeywords?.slice(0, 5).map((kw, i) => (
                      <div key={i} style={{ fontSize: '0.85rem' }}>
                        {i + 1}. {kw.word} ({kw.count}x, {kw.density}%)
                      </div>
                    ))}
                  </span>
                </div>
              </>
            )}
          </div>
        );

      case 'performance':
        return (
          <div style={{ marginTop: '1rem' }}>
            {report.details?.performance && (
              <>
                <div className="detail-item">
                  <span className="detail-label">JS Heap Used</span>
                  <span className="detail-value">{report.details.performance.jsHeapUsed}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estimated Load Time</span>
                  <span className="detail-value">{report.details.performance.estimatedLoadTime}</span>
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Overall Score */}
      <div className="card">
        <h1 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>SEO Analysis Report</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Analysis completed at {new Date(report.timestamp).toLocaleString()}
        </p>

        <div className="score-display">
          <div 
            className="score-circle" 
            style={{ backgroundColor: getScoreColor(report.scores.overall) }}
          >
            {report.scores.overall}
          </div>
          <h2 style={{ color: '#1f2937' }}>Overall SEO Score</h2>
          <p style={{ color: '#6b7280' }}>
            Grade: <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: getScoreColor(report.scores.overall) }}>
              {getScoreGrade(report.scores.overall)}
            </span>
          </p>
        </div>
      </div>

      {/* Score Cards */}
      <div className="score-grid">
        <ScoreCard title="On-Page SEO" score={report.scores.onPage} />
        <ScoreCard title="Technical SEO" score={report.scores.technical} />
        <ScoreCard title="Content Quality" score={report.scores.content} />
        <ScoreCard title="Performance" score={report.scores.performance} />
      </div>

      {/* Findings */}
      {report.findings && (
        <div className="card findings">
          <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Findings</h2>

          {report.findings.critical && report.findings.critical.length > 0 && (
            <div className="findings-section">
              <h3>🚨 Critical Issues ({report.findings.critical.length})</h3>
              <ul className="findings-list">
                {report.findings.critical.map((finding, i) => (
                  <li key={i} className="finding-item finding-critical">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.findings.warnings && report.findings.warnings.length > 0 && (
            <div className="findings-section">
              <h3>⚠️ Warnings ({report.findings.warnings.length})</h3>
              <ul className="findings-list">
                {report.findings.warnings.map((finding, i) => (
                  <li key={i} className="finding-item finding-warning">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.findings.info && report.findings.info.length > 0 && (
            <div className="findings-section">
              <h3>ℹ️ Recommendations ({report.findings.info.length})</h3>
              <ul className="findings-list">
                {report.findings.info.map((finding, i) => (
                  <li key={i} className="finding-item finding-info">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Detailed Sections */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Detailed Analysis</h2>

        {['seo', 'technical', 'content', 'performance'].map(section => (
          <div key={section} style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => toggleSection(section)}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1f2937',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
            >
              {section === 'seo' && 'On-Page SEO'}
              {section === 'technical' && 'Technical SEO'}
              {section === 'content' && 'Content Analysis'}
              {section === 'performance' && 'Performance'}
              <span style={{ float: 'right' }}>
                {expandedSections[section] ? '↓' : '→'}
              </span>
            </button>
            <div className="details-section">
              <SectionContent section={section} expanded={expandedSections[section]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsDisplay;
