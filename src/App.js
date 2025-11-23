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
      
      const response = await axios.get('https://fakestoreapi.com/products?limit=100');
      
      const transformedProducts = response.data.map((product, index) => ({
        id: product.id || index + 1,
        name: product.title ? 
          (product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title) 
          : `Product ${index + 1}`,
        currentInventory: Math.floor(Math.random() * 200) + 10,
        averageSales: Math.floor(Math.random() * 50) + 5,
        leadTime: Math.floor(Math.random() * 14) + 3,
        category: product.category || 'General'
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products from API. Using demo data instead.');
      generateDummyData();
    } finally {
      setLoading(false);
    }
  };

  // Generate dummy data if API fails
  const generateDummyData = () => {
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty'];
    const dummyProducts = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      name: `Product ${index + 1} - ${categories[Math.floor(Math.random() * categories.length)]}`,
      currentInventory: Math.floor(Math.random() * 200) + 10,
      averageSales: Math.floor(Math.random() * 50) + 5,
      leadTime: Math.floor(Math.random() * 14) + 3,
      category: categories[Math.floor(Math.random() * categories.length)]
    }));
    
    setProducts(dummyProducts);
  };

  // Train model and make predictions
  const trainAndPredict = async () => {
    if (products.length === 0) return;
    
    setTraining(true);
    setError(null);
    try {
      await predictor.trainModel(products);
      
      const newPredictions = {};
      for (const product of products) {
        try {
          const prediction = await predictor.predict(product);
          newPredictions[product.id] = prediction;
        } catch (error) {
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
      setError('Prediction failed. Using rule-based recommendations.');
      
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

  // Initialize app
  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
    };
    loadData();
  }, []);

  // Train model when products are loaded
  useEffect(() => {
    const runPredictions = async () => {
      if (products.length > 0) {
        await trainAndPredict();
      }
    };
    runPredictions();
  }, [products]);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Inventory Reorder Predictor</h1>
          <p>Predict which products need to be reordered based on inventory data</p>
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
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          
          <button 
            onClick={trainAndPredict} 
            disabled={training || products.length === 0}
            className="btn-predict"
          >
            {training ? 'Processing...' : 'Update Predictions'}
          </button>
        </div>

        <ProductTable 
          products={products} 
          predictions={predictions}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;