import * as tf from '@tensorflow/tfjs';

export class InventoryPredictor {
  constructor() {
    this.model = null;
    this.isTrained = false;
  }

  // Create and train the model
  async trainModel(trainingData) {
    // Prepare training data
    const features = trainingData.map(product => [
      product.currentInventory,
      product.averageSales,
      product.leadTime
    ]);
    
    const labels = trainingData.map(product => 
      this.shouldReorder(product) ? 1 : 0
    );

    // Convert to tensors
    const featureTensor = tf.tensor2d(features);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    // Create model
    this.model = tf.sequential();
    
    this.model.add(tf.layers.dense({
      inputShape: [3],
      units: 16,
      activation: 'relu'
    }));
    
    this.model.add(tf.layers.dense({
      units: 8,
      activation: 'relu'
    }));
    
    this.model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));

    // Compile model
    this.model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    // Train model
    await this.model.fit(featureTensor, labelTensor, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      verbose: 0
    });

    // Clean up tensors
    featureTensor.dispose();
    labelTensor.dispose();
    
    this.isTrained = true;
  }

  // Predict for a single product
  async predict(product) {
    if (!this.model || !this.isTrained) {
      throw new Error('Model not trained yet');
    }

    const input = tf.tensor2d([[
      product.currentInventory,
      product.averageSales,
      product.leadTime
    ]]);

    const prediction = this.model.predict(input);
    const value = (await prediction.data())[0];
    
    // Clean up
    input.dispose();
    prediction.dispose();

    return {
      probability: value,
      shouldReorder: value > 0.5,
      confidence: Math.abs(value - 0.5) * 2
    };
  }

  // Rule-based fallback
  shouldReorder(product) {
    const weeksOfSupply = product.currentInventory / (product.averageSales / 7);
    const requiredWeeks = product.leadTime / 7;
    
    return weeksOfSupply <= requiredWeeks * 1.5;
  }
}