import React from 'react';

const SECTORS = [
  'Healthcare',
  'Education',
  'Jobs & Skill Development',
  'Agriculture',
  'Financial Services',
  'Housing & Infrastructure',
  'Social Welfare'
];

const DEMOGRAPHICS = [
  'Student',
  'Laborer',
  'Middle Class',
  'Farmer',
  'Women',
  'Elderly',
  'Youth'
];

const GENDERS = [
  { label: 'All Genders', value: 'All' },
  { label: 'Female Only', value: 'Female' },
  { label: 'Male Only', value: 'Male' }
];

export default function Filters({ 
  filterState, 
  setFilterState, 
  uniqueStates, 
  onClear 
}) {
  const handleChange = (key, value) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleDemographic = (demo) => {
    const current = filterState.demographic;
    if (current === demo) {
      handleChange('demographic', ''); // untoggle
    } else {
      handleChange('demographic', demo);
    }
  };

  return (
    <div className="filter-panel">
      <h3>
        <span>Filters</span>
        <button className="clear-btn" onClick={onClear}>Clear All</button>
      </h3>

      {/* Search Input */}
      <div className="filter-group">
        <label htmlFor="search-input">Search Schemes</label>
        <input 
          id="search-input"
          type="text" 
          className="filter-input"
          placeholder="Search name, details..."
          value={filterState.search}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      {/* Level Selector */}
      <div className="filter-group">
        <label>Scheme Type</label>
        <div className="filter-pills">
          <button 
            type="button"
            className={`filter-pill ${filterState.level === '' ? 'active' : ''}`}
            onClick={() => handleChange('level', '')}
          >
            All
          </button>
          <button 
            type="button"
            className={`filter-pill ${filterState.level === 'Central' ? 'active' : ''}`}
            onClick={() => handleChange('level', 'Central')}
          >
            Central Govt
          </button>
          <button 
            type="button"
            className={`filter-pill ${filterState.level === 'State' ? 'active' : ''}`}
            onClick={() => handleChange('level', 'State')}
          >
            State Govt
          </button>
        </div>
      </div>

      {/* State Selector */}
      {filterState.level !== 'Central' && (
        <div className="filter-group">
          <label htmlFor="state-select">Select State</label>
          <select 
            id="state-select"
            className="filter-select"
            value={filterState.state}
            onChange={(e) => handleChange('state', e.target.value)}
          >
            <option value="">All States</option>
            {uniqueStates.filter(s => s !== 'All').map((st, i) => (
              <option key={i} value={st}>{st}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sector Category Selector */}
      <div className="filter-group">
        <label htmlFor="sector-select">Sector Category</label>
        <select 
          id="sector-select"
          className="filter-select"
          value={filterState.sector}
          onChange={(e) => handleChange('sector', e.target.value)}
        >
          <option value="">All Sectors</option>
          {SECTORS.map((sec, i) => (
            <option key={i} value={sec}>{sec}</option>
          ))}
        </select>
      </div>

      {/* Beneficiary Target */}
      <div className="filter-group">
        <label>Target Audience</label>
        <div className="filter-pills">
          {DEMOGRAPHICS.map((demo, i) => (
            <button 
              key={i}
              type="button"
              className={`filter-pill ${filterState.demographic === demo ? 'active' : ''}`}
              onClick={() => toggleDemographic(demo)}
            >
              {demo}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Classification */}
      <div className="filter-group">
        <label htmlFor="gender-select">Gender Classification</label>
        <select 
          id="gender-select"
          className="filter-select"
          value={filterState.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
        >
          {GENDERS.map((g, i) => (
            <option key={i} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
