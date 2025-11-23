import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, reorder: 0, ok: 0 });

  // Generate 100+ products with realistic data
  const generateProducts = () => {
    const categories = [
      'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors', 
      'Books & Media', 'Beauty & Personal Care', 'Toys & Games',
      'Automotive', 'Health & Wellness', 'Office Supplies'
    ];
    
    const productNames = [
      'Smartphone', 'Laptop', 'T-Shirt', 'Jeans', 'Sofa', 'Dining Table',
      'Basketball', 'Tennis Racket', 'Novel', 'Textbook', 'Shampoo', 'Perfume',
      'Action Figure', 'Board Game', 'Car Battery', 'Motor Oil', 'Vitamins', 'Protein Powder',
      'Notebook', 'Pen Set', 'Headphones', 'Smart Watch', 'Jacket', 'Sneakers',
      'Coffee Table', 'Lamp', 'Tent', 'Fishing Rod', 'Cookbook', 'DVD',
      'Makeup Kit', 'Skincare Set', 'Lego Set', 'Puzzle', 'Tire', 'Car Wax',
      'First Aid Kit', 'Yoga Mat', 'Stapler', 'File Folder'
    ];

    const brands = [
      'TechCorp', 'FashionCo', 'HomeEssentials', 'SportPro', 'BookWorld',
      'BeautyGlow', 'ToyMaster', 'AutoParts', 'HealthPlus', 'OfficePro'
    ];

    const generatedProducts = Array.from({ length: 120 }, (_, index) => {
      const currentInventory = Math.floor(Math.random() * 200) + 10;
      const averageSales = Math.floor(Math.random() * 50) + 5;
      const leadTime = Math.floor(Math.random() * 14) + 3;
      
      // Smart reorder logic
      const dailySales = averageSales / 7;
      const daysOfSupply = currentInventory / dailySales;
      const safetyStockDays = 7; // 1 week safety stock
      const shouldReorder = daysOfSupply <= (leadTime + safetyStockDays);
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const productName = productNames[Math.floor(Math.random() * productNames.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      
      return {
        id: index + 1,
        name: `${brand} ${productName} ${index + 1}`,
        currentInventory,
        averageSales,
        leadTime,
        shouldReorder,
        category,
        daysOfSupply: Math.round(daysOfSupply),
        urgency: shouldReorder ? (daysOfSupply < leadTime ? 'HIGH' : 'MEDIUM') : 'LOW'
      };
    });
    
    setProducts(generatedProducts);
    calculateStats(generatedProducts);
    setLoading(false);
  };

  // Try to fetch from API first, fallback to generated data
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Try multiple APIs to get real product data
      const responses = await Promise.allSettled([
        axios.get('https://fakestoreapi.com/products?limit=20'),
        axios.get('https://dummyjson.com/products?limit=30'),
        axios.get('https://api.escuelajs.co/api/v1/products?limit=30')
      ]);

      let allProducts = [];
      
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.data) {
          const apiProducts = Array.isArray(response.value.data) 
            ? response.value.data 
            : (response.value.data.products || []);
          
          const transformed = apiProducts.map((product, productIndex) => {
            const currentInventory = Math.floor(Math.random() * 200) + 10;
            const averageSales = Math.floor(Math.random() * 50) + 5;
            const leadTime = Math.floor(Math.random() * 14) + 3;
            const dailySales = averageSales / 7;
            const daysOfSupply = currentInventory / dailySales;
            const safetyStockDays = 7;
            const shouldReorder = daysOfSupply <= (leadTime + safetyStockDays);

            return {
              id: `${index}-${productIndex}`,
              name: product.title || product.name || `Product ${productIndex + 1}`,
              currentInventory,
              averageSales,
              leadTime,
              shouldReorder,
              category: product.category || 'General',
              daysOfSupply: Math.round(daysOfSupply),
              urgency: shouldReorder ? (daysOfSupply < leadTime ? 'HIGH' : 'MEDIUM') : 'LOW'
            };
          });
          
          allProducts = [...allProducts, ...transformed];
        }
      });

      // If we got some products from APIs, use them + generate the rest
      if (allProducts.length > 0) {
        const remainingCount = 120 - allProducts.length;
        if (remainingCount > 0) {
          const additionalProducts = Array.from({ length: remainingCount }, (_, index) => 
            generateSingleProduct(allProducts.length + index + 1)
          );
          allProducts = [...allProducts, ...additionalProducts];
        }
        setProducts(allProducts);
        calculateStats(allProducts);
      } else {
        // If all APIs failed, generate all products
        generateProducts();
      }
    } catch (error) {
      console.error('All APIs failed, using generated data:', error);
      generateProducts();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate single product
  const generateSingleProduct = (id) => {
    const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive', 'Health', 'Office'];
    const productNames = ['Smartphone', 'Laptop', 'T-Shirt', 'Jeans', 'Sofa', 'Basketball', 'Novel', 'Shampoo', 'Action Figure', 'Car Battery'];
    const brands = ['TechCorp', 'FashionCo', 'HomeEssentials', 'SportPro', 'BookWorld', 'BeautyGlow', 'ToyMaster', 'AutoParts', 'HealthPlus', 'OfficePro'];

    const currentInventory = Math.floor(Math.random() * 200) + 10;
    const averageSales = Math.floor(Math.random() * 50) + 5;
    const leadTime = Math.floor(Math.random() * 14) + 3;
    const dailySales = averageSales / 7;
    const daysOfSupply = currentInventory / dailySales;
    const safetyStockDays = 7;
    const shouldReorder = daysOfSupply <= (leadTime + safetyStockDays);

    return {
      id,
      name: `${brands[Math.floor(Math.random() * brands.length)]} ${productNames[Math.floor(Math.random() * productNames.length)]} ${id}`,
      currentInventory,
      averageSales,
      leadTime,
      shouldReorder,
      category: categories[Math.floor(Math.random() * categories.length)],
      daysOfSupply: Math.round(daysOfSupply),
      urgency: shouldReorder ? (daysOfSupply < leadTime ? 'HIGH' : 'MEDIUM') : 'LOW'
    };
  };

  // Calculate dashboard statistics
  const calculateStats = (products) => {
    const total = products.length;
    const reorder = products.filter(p => p.shouldReorder).length;
    const ok = total - reorder;
    const highUrgency = products.filter(p => p.urgency === 'HIGH').length;
    
    setStats({ total, reorder, ok, highUrgency });
  };

  // Export to CSV functionality
  const exportToCSV = () => {
    const reorderProducts = products.filter(p => p.shouldReorder);
    const csvContent = [
      ['Product ID', 'Product Name', 'Current Inventory', 'Avg Sales/Week', 'Lead Time (Days)', 'Days of Supply', 'Urgency'],
      ...reorderProducts.map(product => [
        product.id,
        `"${product.name}"`,
        product.currentInventory,
        product.averageSales,
        product.leadTime,
        product.daysOfSupply,
        product.urgency
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reorder-list.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Show critical alerts
  const showCriticalAlerts = () => {
    const criticalProducts = products.filter(p => p.urgency === 'HIGH');
    if (criticalProducts.length === 0) {
      alert('✅ No critical products found! Inventory is well-stocked.');
    } else {
      const productNames = criticalProducts.map(p => p.name).join('\n• ');
      alert(`🚨 CRITICAL ALERT: ${criticalProducts.length} products need immediate attention!\n\n• ${productNames}\n\nThese will run out before the next delivery!`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <h2>🔄 Loading Inventory Data...</h2>
        <p>Fetching 120 products from multiple sources</p>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>📦 Inventory Reorder Predictor</h1>
        <p>Smart inventory management system • {products.length} Products Loaded</p>
      </header>

      <main className="app-main">
        {/* Dashboard */}
        <div className="dashboard">
          <h2>📊 Dashboard Overview</h2>
          <div className="stats">
            <div className="stat-card total">
              <h3>Total Products</h3>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-desc">Items in inventory</div>
            </div>
            <div className="stat-card reorder">
              <h3>Need Reorder</h3>
              <div className="stat-number">{stats.reorder}</div>
              <div className="stat-percent">
                {((stats.reorder / stats.total) * 100).toFixed(1)}%
              </div>
              <div className="stat-desc">Require attention</div>
            </div>
            <div className="stat-card ok">
              <h3>Inventory OK</h3>
              <div className="stat-number">{stats.ok}</div>
              <div className="stat-percent">
                {((stats.ok / stats.total) * 100).toFixed(1)}%
              </div>
              <div className="stat-desc">Adequate stock</div>
            </div>
            <div className="stat-card critical">
              <h3>Critical Items</h3>
              <div className="stat-number">{stats.highUrgency || 0}</div>
              <div className="stat-desc">Immediate action needed</div>
            </div>
          </div>

          <div className="dashboard-actions">
            <button onClick={fetchProducts} className="btn refresh">
              🔄 Refresh Data ({products.length} products)
            </button>
            <button onClick={exportToCSV} className="btn export">
              📊 Export Reorder List
            </button>
            <button onClick={showCriticalAlerts} className="btn alert">
              🚨 Critical Alerts
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="products-table">
          <h2>🛍️ Product Inventory & Reorder Recommendations</h2>
          <p className="table-info">
            Showing {products.length} products • {products.filter(p => p.shouldReorder).length} need reorder
          </p>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Inventory</th>
                  <th>Avg Sales/Week</th>
                  <th>Lead Time (Days)</th>
                  <th>Days of Supply</th>
                  <th>Reorder Recommendation</th>
                  <th>Urgency</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className={`${product.shouldReorder ? 'reorder' : ''} ${product.urgency === 'HIGH' ? 'critical' : ''}`}>
                    <td className="product-id">#{product.id}</td>
                    <td className="product-name">{product.name}</td>
                    <td className="product-category">{product.category}</td>
                    <td className="inventory">{product.currentInventory}</td>
                    <td className="sales">{product.averageSales}</td>
                    <td className="lead-time">{product.leadTime}</td>
                    <td className="supply-days">{product.daysOfSupply}</td>
                    <td>
                      <span className={`status ${product.shouldReorder ? 'reorder' : 'ok'}`}>
                        {product.shouldReorder ? '🔄 REORDER' : '✅ OK'}
                      </span>
                    </td>
                    <td>
                      <span className={`urgency ${product.urgency.toLowerCase()}`}>
                        {product.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="table-footer">
            <p>
              <strong>Inventory Analysis:</strong> {products.filter(p => p.shouldReorder).length} products need reordering. 
              {products.filter(p => p.urgency === 'HIGH').length > 0 && 
                ` ${products.filter(p => p.urgency === 'HIGH').length} require immediate attention.`
              }
            </p>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Inventory Management System • {products.length} Products • Built with React</p>
      </footer>
    </div>
  );
}

export default App;