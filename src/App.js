import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { InventoryPredictor } from './utils/predictionModel';
import Dashboard from './components/Dashboard';
import ProductTable from './components/ProductTable';
import PredictionChart from './components/PredictionChart';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState(null);
  const [predictor] = useState(new InventoryPredictor());

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using dummy API - replace with your actual API
      const response = await axios.get('https://fakestoreapi.com/products?limit=120');
      
      // Transform API data to our format
      const transformedProducts = response.data.map((product, index) => ({
        id: product.id,
        name: product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title,
        currentInventory: Math.floor(Math.random() * 200) + 10, // Random inventory 10-210
        averageSales: Math.floor(Math.random() * 50) + 5, // Random sales 5-55 per week
        leadTime: Math.floor(Math.random() * 14) + 3, // Random lead time 3-17 days
        category: product.category,
        price: product.price,
        image: product.image
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products from API. Using demo data instead.');
      
      // Fallback: Generate dummy data if API fails
      generateDummyData();
    } finally {
      setLoading(false);
    }
  };

  // Generate dummy data if API fails
  const generateDummyData = () => {
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty'];
    const dummyProducts = Array.from({ length: 120 }, (_, index) => ({
      id: index + 1,
      name: `Product ${index + 1} - ${categories[Math.floor(Math.random() * categories.length)]}`,
      currentInventory: Math.floor(Math.random() * 200) + 10,
      averageSales: Math.floor(Math.random() * 50) + 5,
      leadTime: Math.floor(Math.random() * 14) + 3,
      category: categories[Math.floor(Math.random() * categories.length)],
      price: (Math.random() * 100 + 1).toFixed(2),
      image: `https://picsum.photos/100/100?random=${index}`
    }));
    
    setProducts(dummyProducts);
  };

  // Train model and make predictions
  const trainAndPredict = async () => {
    if (products.length === 0) return;
    
    setTraining(true);
    setError(null);
    try {
      // Train the model
      await predictor.trainModel(products);
      
      // Make predictions for each product
      const newPredictions = {};
      for (const product of products) {
        try {
          const prediction = await predictor.predict(product);
          newPredictions[product.id] = prediction;
        } catch (error) {
          console.warn(`Prediction failed for product ${product.id}, using rule-based fallback`);
          // Fallback to rule-based prediction
          newPredictions[product.id] = {
            shouldReorder: predictor.shouldReorder(product),
            confidence: 0.8,
            probability: predictor.shouldReorder(product) ? 0.7 : 0.3
          };
        }
      }
      
      setPredictions(newPredictions);
    } catch (error) {
      console.error('Error in prediction:', error);
      setError('AI prediction failed. Using rule-based recommendations.');
      
      // Fallback to rule-based predictions
      const ruleBasedPredictions = {};
      products.forEach(product => {
        ruleBasedPredictions[product.id] = {
          shouldReorder: predictor.shouldReorder(product),
          confidence: 0.9,
          probability: predictor.shouldReorder(product) ? 0.8 : 0.2
        };
      });
      setPredictions(ruleBasedPredictions);
    } finally {
      setTraining(false);
    }
  };

  // Export reorder list
  const exportReorderList = () => {
    const reorderProducts = products.filter(product => 
      predictions[product.id]?.shouldReorder
    );
    
    const csvContent = [
      ['Product ID', 'Product Name', 'Current Inventory', 'Avg Sales/Week', 'Lead Time (Days)', 'Urgency'],
      ...reorderProducts.map(product => [
        product.id,
        product.name,
        product.currentInventory,
        product.averageSales,
        product.leadTime,
        predictions[product.id]?.confidence > 0.8 ? 'HIGH' : 'MEDIUM'
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

  // Send critical alerts
  const sendCriticalAlerts = () => {
    const criticalProducts = products.filter(product => {
      const weeksOfSupply = product.currentInventory / (product.averageSales / 7);
      return weeksOfSupply < product.leadTime / 7;
    });

    alert(`🚨 ${criticalProducts.length} critical products need immediate attention!\n\nThey will run out of stock before the next delivery.`);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      trainAndPredict();
    }
  }, [products]);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🏭 Inventory Reorder Predictor</h1>
          <p>AI-powered inventory management system with TensorFlow.js</p>
          <div className="header-badges">
            <span className="badge ai">AI-Powered</span>
            <span className="badge realtime">Real-time</span>
            <span className="badge predictive">Predictive Analytics</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        <Dashboard products={products} predictions={predictions} />
        
        <PredictionChart products={products} predictions={predictions} />

        <div className="controls">
          <button 
            onClick={fetchProducts} 
            disabled={loading}
            className="btn-refresh"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh Data'}
          </button>
          
          <button 
            onClick={trainAndPredict} 
            disabled={training || products.length === 0}
            className="btn-predict"
          >
            {training ? '🤖 Training AI...' : '🔮 Update Predictions'}
          </button>

          <button 
            onClick={exportReorderList}
            disabled={Object.keys(predictions).length === 0}
            className="btn-export"
          >
            📊 Export Reorder List
          </button>

          <button 
            onClick={sendCriticalAlerts}
            disabled={products.length === 0}
            className="btn-alert"
          >
            🚨 Critical Alerts
          </button>
        </div>

        <ProductTable 
          products={products} 
          predictions={predictions}
          loading={loading}
        />
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>Inventory Reorder Predictor</strong> | 
            Built with React & TensorFlow.js | 
            AI/ML Powered Inventory Management
          </p>
          <div className="tech-stack">
            <span>Tech Stack: React • TensorFlow.js • AI/ML • CSS3 • Axios</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;