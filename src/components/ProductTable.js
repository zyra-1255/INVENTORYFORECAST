import React from 'react';

const ProductTable = ({ products, predictions, loading }) => {
  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <section className="section">
      <h2 className="section-title">Product Inventory & Predictions</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Current Inventory</th>
              <th>Avg Sales/Week</th>
              <th>Lead Time (Days)</th>
              <th>Reorder Recommendation</th>
              <th>Confidence</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const prediction = predictions[product.id];
              const weeksOfSupply = product.currentInventory / (product.averageSales / 7);
              const riskLevel = weeksOfSupply < product.leadTime / 7 ? 'High' : 'Low';
              
              return (
                <tr key={product.id} className={prediction?.shouldReorder ? 'reorder-row' : ''}>
                  <td>{product.name}</td>
                  <td>{product.currentInventory}</td>
                  <td>{product.averageSales}</td>
                  <td>{product.leadTime}</td>
                  <td>
                    <span className={`status ${prediction?.shouldReorder ? 'reorder' : 'ok'}`}>
                      {prediction?.shouldReorder ? '🔄 REORDER' : '✅ OK'}
                    </span>
                  </td>
                  <td>
                    {prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td>
                    <span className={`risk ${riskLevel.toLowerCase()}`}>
                      {riskLevel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProductTable;