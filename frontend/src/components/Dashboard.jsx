import React from 'react';

const SECTOR_COLORS = {
  'Healthcare': '#10b981',        // Emerald
  'Education': '#3b82f6',         // Blue
  'Jobs & Skill Development': '#8b5cf6', // Purple
  'Agriculture': '#f59e0b',       // Amber
  'Financial Services': '#ec4899', // Pink
  'Housing & Infrastructure': '#06b6d4', // Cyan
  'Social Welfare': '#6b7280',     // Gray
};

export default function Dashboard({ schemes }) {
  // 1. Calculate general stats
  const totalSchemes = schemes.length;
  const totalBudget = schemes.reduce((sum, s) => sum + (Number(s.budget) || 0), 0);
  const centralSchemes = schemes.filter(s => s.level === 'Central').length;
  const stateSchemes = schemes.filter(s => s.level === 'State').length;

  // 2. Aggregate sector data for the bar chart
  const sectorDataMap = {};
  schemes.forEach(s => {
    const sector = s.sector || 'Social Welfare';
    if (!sectorDataMap[sector]) {
      sectorDataMap[sector] = { count: 0, budget: 0 };
    }
    sectorDataMap[sector].count += 1;
    sectorDataMap[sector].budget += Number(s.budget) || 0;
  });

  const sectorData = Object.keys(sectorDataMap).map(name => ({
    name,
    count: sectorDataMap[name].count,
    budget: sectorDataMap[name].budget,
    color: SECTOR_COLORS[name] || '#6b7280',
  })).sort((a, b) => b.budget - a.budget);

  const maxBudget = Math.max(...sectorData.map(d => d.budget), 1);

  // 3. Compute demographics distribution
  const demographicCounts = {};
  schemes.forEach(s => {
    const dem = Array.isArray(s.demographics) 
      ? s.demographics 
      : (s.demographics ? s.demographics.split(',').map(d => d.trim()) : []);
    
    dem.forEach(d => {
      if (d) {
        demographicCounts[d] = (demographicCounts[d] || 0) + 1;
      }
    });
  });

  const demographicList = Object.keys(demographicCounts).map(name => ({
    name,
    count: demographicCounts[name],
  })).sort((a, b) => b.count - a.count);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPIs */}
      <div className="dashboard-grid">
        <div className="kpi-card">
          <div className="kpi-icon">📜</div>
          <div className="kpi-info">
            <h4>Total Schemes</h4>
            <div className="kpi-value">{totalSchemes}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon budget">💰</div>
          <div className="kpi-info">
            <h4>Total Budget</h4>
            <div className="kpi-value">₹{totalBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon central">🏛️</div>
          <div className="kpi-info">
            <h4>Central / State Split</h4>
            <div className="kpi-value">{centralSchemes} C / {stateSchemes} S</div>
          </div>
        </div>
      </div>

      {/* Visualizations */}
      <div className="visuals-section">
        {/* Sector Budget Chart */}
        <div className="visual-card">
          <h3>Sector Budget Allocation (INR Crores)</h3>
          <div className="custom-bar-chart">
            {sectorData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No budget data available.</p>
            ) : (
              sectorData.map((d, index) => {
                const widthPercent = (d.budget / maxBudget) * 100;
                return (
                  <div key={index} className="chart-bar-row">
                    <div className="chart-bar-label" title={d.name}>{d.name}</div>
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar-fill" 
                        style={{ 
                          width: `${widthPercent}%`,
                          background: `linear-gradient(90deg, ${d.color} 0%, hsl(200, 30%, 40%) 100%)`
                        }}
                      />
                    </div>
                    <div className="chart-bar-value">
                      ₹{d.budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Demographics Split */}
        <div className="visual-card">
          <h3>Beneficiary Targets (Scheme Count)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.5rem 0' }}>
            {demographicList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No beneficiary data.</p>
            ) : (
              demographicList.slice(0, 5).map((d, index) => {
                const maxCount = Math.max(...demographicList.map(item => item.count), 1);
                const pct = (d.count / maxCount) * 100;
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 500 }}>{d.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{d.count} Schemes</span>
                    </div>
                    <div style={{ height: '6px', background: 'hsla(223, 30%, 30%, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${pct}%`, 
                          background: 'var(--primary)',
                          borderRadius: '3px'
                        }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
