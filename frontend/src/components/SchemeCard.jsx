import React from 'react';

export default function SchemeCard({ scheme, onClick }) {
  // Format demographics for printing
  const demographicLabel = Array.isArray(scheme.demographics)
    ? scheme.demographics.join(', ')
    : scheme.demographics;

  return (
    <div className="scheme-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-top">
        <div className="card-tags">
          <span className={`tag level-${scheme.level.toLowerCase()}`}>
            {scheme.level === 'Central' ? 'Central' : scheme.state}
          </span>
          <span className="tag sector-tag">
            {scheme.sector || 'Social Welfare'}
          </span>
          {scheme.gender !== 'All' && (
            <span className="tag" style={{ background: '#ec489920', color: '#f472b6', border: '1px solid #db277720' }}>
              👤 {scheme.gender} Only
            </span>
          )}
        </div>
        <h3>{scheme.name}</h3>
        <p>{scheme.description}</p>
      </div>

      <div className="card-bottom">
        <div className="card-budget">
          <span>Est. Budget</span>
          <span>
            {scheme.budget 
              ? `₹${scheme.budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr` 
              : 'N/A'}
          </span>
        </div>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Details →
        </button>
      </div>
    </div>
  );
}
