import React from 'react';
import SchemeCard from './SchemeCard';

export default function SchemeGrid({ schemes, onSelectScheme }) {
  if (schemes.length === 0) {
    return (
      <div className="empty-state">
        <h4>No Schemes Found</h4>
        <p>Try refining your search keyword, changing filters, or running the AI scraping agent to retrieve new updates.</p>
      </div>
    );
  }

  return (
    <div className="scheme-grid">
      {schemes.map((scheme, i) => (
        <SchemeCard 
          key={scheme.id || i} 
          scheme={scheme} 
          onClick={() => onSelectScheme(scheme)} 
        />
      ))}
    </div>
  );
}
