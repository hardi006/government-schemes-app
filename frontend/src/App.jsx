import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Filters from './components/Filters';
import SchemeGrid from './components/SchemeGrid';
import ScraperTerminal from './components/ScraperTerminal';

const DEFAULT_FILTERS = {
  search: '',
  level: '',
  state: '',
  sector: '',
  demographic: '',
  gender: 'All'
};

export default function App() {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [filterState, setFilterState] = useState(DEFAULT_FILTERS);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schemes');
      if (!res.ok) throw new Error('Failed to retrieve schemes list.');
      const data = await res.json();
      setSchemes(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to schemes database. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Filter schemes when schemes array or filters change
  useEffect(() => {
    let result = [...schemes];

    // 1. Search Query Filter
    if (filterState.search.trim()) {
      const q = filterState.search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.benefits && s.benefits.toLowerCase().includes(q)) ||
        (s.eligibility && s.eligibility.toLowerCase().includes(q)) ||
        s.sector.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
      );
    }

    // 2. Level Filter (Central/State)
    if (filterState.level) {
      result = result.filter(s => s.level === filterState.level);
    }

    // 3. State Filter
    if (filterState.state && filterState.level !== 'Central') {
      result = result.filter(s => s.state === filterState.state || s.state === 'All');
    }

    // 4. Sector Filter
    if (filterState.sector) {
      result = result.filter(s => s.sector === filterState.sector);
    }

    // 5. Demographic Filter
    if (filterState.demographic) {
      result = result.filter(s => {
        const demos = Array.isArray(s.demographics)
          ? s.demographics
          : (s.demographics ? s.demographics.split(',').map(d => d.trim()) : []);
        return demos.includes(filterState.demographic);
      });
    }

    // 6. Gender Filter
    if (filterState.gender !== 'All') {
      result = result.filter(s => s.gender === filterState.gender || s.gender === 'All');
    }

    setFilteredSchemes(result);
  }, [schemes, filterState]);

  // Extract unique states for dropdown
  const uniqueStates = [...new Set(schemes.map(s => s.state))].filter(Boolean);

  const handleClearFilters = () => {
    setFilterState(DEFAULT_FILTERS);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <h1>India SchemeFinder</h1>
          <p>AI-Powered Indian Central & State Welfare Schemes Intelligence Dashboard</p>
        </div>
        <div className="header-actions">
          <a href="/api/download/csv" className="btn btn-secondary" download>
            📥 Download CSV
          </a>
          <a href="/api/download/xlsx" className="btn btn-success" download>
            📊 Download Excel (XLSX)
          </a>
        </div>
      </header>

      {/* Real-time Web Crawler Command Terminal */}
      <ScraperTerminal onScrapeComplete={fetchSchemes} />

      {/* Main Stats / Visual Insights */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading scheme insights data...
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', background: 'hsla(350, 89%, 60%, 0.15)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)' }}>
          {error}
        </div>
      ) : (
        <Dashboard schemes={filteredSchemes} />
      )}

      {/* Main Filter & Explore Section */}
      <div className="explore-section">
        <Filters 
          filterState={filterState} 
          setFilterState={setFilterState} 
          uniqueStates={uniqueStates}
          onClear={handleClearFilters}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="results-header">
            <span>Showing {filteredSchemes.length} of {schemes.length} schemes</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Refreshing listings...
            </div>
          ) : (
            <SchemeGrid 
              schemes={filteredSchemes} 
              onSelectScheme={setSelectedScheme} 
            />
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedScheme && (
        <div className="modal-overlay" onClick={() => setSelectedScheme(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedScheme(null)}>×</button>
            
            <div className="modal-header">
              <div className="modal-title-tags">
                <span className={`tag level-${selectedScheme.level.toLowerCase()}`}>
                  {selectedScheme.level === 'Central' ? 'Central Government' : `${selectedScheme.state} State`}
                </span>
                <span className="tag sector-tag">
                  {selectedScheme.sector || 'Social Welfare'}
                </span>
              </div>
              <h2>{selectedScheme.name}</h2>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>Description</h4>
                <p>{selectedScheme.description}</p>
              </div>

              <div className="modal-section">
                <h4>Key Benefits</h4>
                <p>{selectedScheme.benefits || 'No specific benefits text detailed.'}</p>
              </div>

              <div className="modal-section">
                <h4>Eligibility Criteria</h4>
                <p>{selectedScheme.eligibility || 'Open to target demographic groups.'}</p>
              </div>

              <div className="modal-meta-grid">
                <div className="meta-item">
                  <span>Target Beneficiaries</span>
                  <span>{Array.isArray(selectedScheme.demographics) ? selectedScheme.demographics.join(', ') : selectedScheme.demographics}</span>
                </div>
                <div className="meta-item">
                  <span>Gender</span>
                  <span>{selectedScheme.gender === 'All' ? 'All Genders (Male/Female)' : selectedScheme.gender}</span>
                </div>
                <div className="meta-item">
                  <span>Budget Allocation</span>
                  <span style={{ color: 'var(--success)' }}>
                    {selectedScheme.budget 
                      ? `₹${selectedScheme.budget.toLocaleString('en-IN')} Crore` 
                      : 'Not Disclosed'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedScheme(null)}>Close Details</button>
              {selectedScheme.source_url && (
                <a 
                  href={selectedScheme.source_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-primary"
                >
                  Apply / Official Portal ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
