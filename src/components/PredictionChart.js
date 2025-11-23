import React from 'react';

const PredictionChart = ({ products, predictions }) => {
  if (!products.length || !Object.keys(predictions).length) {
    return <div className="chart-loading">Loading chart data...</div>;
  }

  const reorderData = Object.values(predictions).filter(p => p.shouldReorder).length;
  const okData = products.length - reorderData;

  const riskLevels = products.reduce((acc, product) => {
    const weeksOfSupply = product.currentInventory / (product.averageSales / 7);
    const requiredWeeks = product.leadTime / 7;
    const riskRatio = weeksOfSupply / requiredWeeks;
    
    if (riskRatio < 0.5) return { ...acc, critical: acc.critical + 1 };
    if (riskRatio < 1) return { ...acc, high: acc.high + 1 };
    if (riskRatio < 1.5) return { ...acc, medium: acc.medium + 1 };
    return { ...acc, low: acc.low + 1 };
  }, { critical: 0, high: 0, medium: 0, low: 0 });

  return (
    <section className="section">
      <h2 className="section-title">Analytics & Predictions</h2>
      <div className="charts-grid">
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
      </div>
    </section>
  );
};

export default PredictionChart;