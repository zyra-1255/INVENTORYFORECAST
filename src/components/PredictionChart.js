import React from 'react';

const PredictionChart = ({ products, predictions }) => {
  if (!products.length || !Object.keys(predictions).length) {
    return <div className="chart-loading">Loading chart data...</div>;
  }

  // Calculate data for charts
  const reorderData = Object.values(predictions).filter(p => p.shouldReorder).length;
  const okData = products.length - reorderData;

  // Risk level analysis
  const riskLevels = products.reduce((acc, product) => {
    const weeksOfSupply = product.currentInventory / (product.averageSales / 7);
    const requiredWeeks = product.leadTime / 7;
    const riskRatio = weeksOfSupply / requiredWeeks;
    
    if (riskRatio < 0.5) return { ...acc, critical: acc.critical + 1 };
    if (riskRatio < 1) return { ...acc, high: acc.high + 1 };
    if (riskRatio < 1.5) return { ...acc, medium: acc.medium + 1 };
    return { ...acc, low: acc.low + 1 };
  }, { critical: 0, high: 0, medium: 0, low: 0 });

  // Category analysis
  const categories = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) acc[category] = 0;
    acc[category]++;
    return acc;
  }, {});

  return (
    <div className="prediction-charts">
      <h3>📊 Analytics & Predictions</h3>
      
      <div className="charts-grid">
        {/* Reorder Status Chart */}
        <div className="chart-card">
          <h4>Reorder Status</h4>
          <div className="chart-container">
            <div className="doughnut-chart">
              <div className="chart-segment reorder" 
                   style={{'--percentage': `${(reorderData / products.length) * 100}%`}}>
                <span>Reorder: {reorderData}</span>
              </div>
              <div className="chart-segment ok" 
                   style={{'--percentage': `${(okData / products.length) * 100}%`}}>
                <span>OK: {okData}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Level Chart */}
        <div className="chart-card">
          <h4>Risk Levels</h4>
          <div className="risk-bars">
            <div className="risk-bar critical">
              <label>Critical: {riskLevels.critical}</label>
              <div className="bar" style={{width: `${(riskLevels.critical / products.length) * 100}%`}}></div>
            </div>
            <div className="risk-bar high">
              <label>High: {riskLevels.high}</label>
              <div className="bar" style={{width: `${(riskLevels.high / products.length) * 100}%`}}></div>
            </div>
            <div className="risk-bar medium">
              <label>Medium: {riskLevels.medium}</label>
              <div className="bar" style={{width: `${(riskLevels.medium / products.length) * 100}%`}}></div>
            </div>
            <div className="risk-bar low">
              <label>Low: {riskLevels.low}</label>
              <div className="bar" style={{width: `${(riskLevels.low / products.length) * 100}%`}}></div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card">
          <h4>Categories</h4>
          <div className="category-list">
            {Object.entries(categories).map(([category, count]) => (
              <div key={category} className="category-item">
                <span className="category-name">{category}</span>
                <span className="category-count">{count}</span>
                <div className="category-bar" style={{width: `${(count / products.length) * 100}%`}}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Confidence */}
        <div className="chart-card">
          <h4>AI Confidence</h4>
          <div className="confidence-stats">
            <div className="confidence-item">
              <span>High Confidence (&gt;80%)</span>
              <span>
                {Object.values(predictions).filter(p => p.confidence > 0.8).length}
              </span>
            </div>
            <div className="confidence-item">
              <span>Medium Confidence (50-80%)</span>
              <span>
                {Object.values(predictions).filter(p => p.confidence > 0.5 && p.confidence <= 0.8).length}
              </span>
            </div>
            <div className="confidence-item">
              <span>Low Confidence (&lt;50%)</span>
              <span>
                {Object.values(predictions).filter(p => p.confidence <= 0.5).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <h4>Key Metrics</h4>
        <div className="metrics-grid">
          <div className="metric">
            <span className="metric-label">Avg Inventory</span>
            <span className="metric-value">
              {Math.round(products.reduce((sum, p) => sum + p.currentInventory, 0) / products.length)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Avg Sales/Week</span>
            <span className="metric-value">
              {Math.round(products.reduce((sum, p) => sum + p.averageSales, 0) / products.length)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Avg Lead Time</span>
            <span className="metric-value">
              {Math.round(products.reduce((sum, p) => sum + p.leadTime, 0) / products.length)} days
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Reorder Rate</span>
            <span className="metric-value">
              {((reorderData / products.length) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;