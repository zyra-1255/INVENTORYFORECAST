import React from 'react';

const Dashboard = ({ products, predictions }) => {
  const totalProducts = products.length;
  const reorderCount = Object.values(predictions).filter(p => p.shouldReorder).length;
  const okCount = totalProducts - reorderCount;
  
  const highRiskProducts = products.filter(product => {
    const weeksOfSupply = product.currentInventory / (product.averageSales / 7);
    return weeksOfSupply < product.leadTime / 7;
  }).length;

  return (
    <section className="section">
      <h2 className="section-title">Inventory Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total Products</h3>
          <p className="stat-number">{totalProducts}</p>
        </div>
        
        <div className="stat-card reorder">
          <h3>Need Reorder</h3>
          <p className="stat-number">{reorderCount}</p>
          <p className="stat-percent">{((reorderCount / totalProducts) * 100).toFixed(1)}%</p>
        </div>
        
        <div className="stat-card ok">
          <h3>Inventory OK</h3>
          <p className="stat-number">{okCount}</p>
          <p className="stat-percent">{((okCount / totalProducts) * 100).toFixed(1)}%</p>
        </div>
        
        <div className="stat-card risk">
          <h3>High Risk</h3>
          <p className="stat-number">{highRiskProducts}</p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;