import React, { useState, useEffect, useRef } from 'react';

export default function ScraperTerminal({ onScrapeComplete }) {
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState([
    '[SYSTEM] Agent Idle. Ready to crawl scheme portals.'
  ]);
  const [isScraping, setIsScraping] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom of terminal whenever logs change
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleScrape = () => {
    if (isScraping) return;

    setIsScraping(true);
    setLogs([
      `[SYSTEM] Spawning crawling agent child process...`,
      `[SYSTEM] Connecting to backend scraping terminal...`
    ]);

    // Encode search query
    const encodedQuery = encodeURIComponent(query);
    const eventSource = new EventSource(`/api/scrape?query=${encodedQuery}`);

    eventSource.onmessage = (event) => {
      const line = event.data;
      setLogs(prev => [...prev, line]);
    };

    eventSource.addEventListener('complete', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'success') {
          setLogs(prev => [
            ...prev,
            `[SYSTEM] Scraping child process exited with code 0 (SUCCESS).`,
            `[SYSTEM] Refreshing UI dashboard database data...`
          ]);
          onScrapeComplete();
        } else {
          setLogs(prev => [
            ...prev,
            `[SYSTEM] Scraping process exited with errors (Code ${data.code}).`
          ]);
        }
      } catch (err) {
        setLogs(prev => [...prev, `[SYSTEM] Scraper completed.`]);
        onScrapeComplete();
      }
      setIsScraping(false);
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      setLogs(prev => [
        ...prev,
        `[ERROR] Connection lost or server terminated process.`
      ]);
      setIsScraping(false);
      eventSource.close();
    };
  };

  const getLogClass = (line) => {
    if (line.startsWith('[INFO]')) return 'log-line log-info';
    if (line.startsWith('[SCRAPE]')) return 'log-line log-scrape';
    if (line.startsWith('[ANALYZE]')) return 'log-line log-analyze';
    if (line.startsWith('[SUCCESS]')) return 'log-line log-success';
    if (line.startsWith('[WARNING]')) return 'log-line log-warning';
    if (line.startsWith('[ERROR]')) return 'log-line log-error';
    return 'log-line log-info';
  };

  return (
    <div className="terminal-card">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <span className="terminal-title">agent_crawler.sh</span>
        <span style={{ fontSize: '0.75rem', color: isScraping ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
          {isScraping ? '● RUNNING' : '● ONLINE'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
        <input 
          type="text"
          className="filter-input"
          style={{ flexGrow: 1, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', height: '36px', padding: '0.5rem' }}
          placeholder="Enter scheme name / keyword to search & scrape (e.g. student scholarship, UP health)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isScraping}
          onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
        />
        <button 
          className="btn btn-primary"
          style={{ height: '36px', padding: '0 1.25rem', fontSize: '0.8rem' }}
          onClick={handleScrape}
          disabled={isScraping}
        >
          {isScraping ? 'Scraping...' : 'Run Scraper Agent'}
        </button>
      </div>

      <div className="terminal-logs">
        {logs.map((line, i) => (
          <div key={i} className={getLogClass(line)}>
            {line}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
