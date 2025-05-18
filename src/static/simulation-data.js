
/**
 * Utility functions and simulation data for the compression dashboard
 */

// Generate a random number between min and max
function randomNumber(min, max) {
  return min + Math.random() * (max - min);
}

// Generate a random compression value between 0.1 and 0.9
function randomCompressionRatio() {
  return 0.1 + Math.random() * 0.8;
}

// Generate random compression time between 1ms and 20ms
function randomCompressionTime() {
  return 1 + Math.random() * 19;
}

// Format bytes to human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Generate sample devices
function generateDevices() {
  const deviceTypes = ['Sensor', 'Controller', 'Gateway', 'Camera'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `device-${i + 1}`,
    name: `IoT ${deviceTypes[i % deviceTypes.length]} ${i + 1}`,
    type: deviceTypes[i % deviceTypes.length],
    status: Math.random() > 0.2 ? 'active' : 'inactive',
    dataRate: Math.floor(10 + Math.random() * 90),
    lastSeen: new Date(Date.now() - Math.floor(Math.random() * 60000)).toISOString()
  }));
}

// Generate a historical data point
function generateDataPoint(timestamp) {
  const dataSize = 1000 + Math.random() * 9000;
  return {
    timestamp,
    huffman: 1 - (0.2 + Math.random() * 0.3),
    delta: 1 - (0.3 + Math.random() * 0.3),
    dataSize
  };
}

// Generate historical data points
function generateHistoricalData(points) {
  const now = Date.now();
  const interval = 60000; // 1 minute interval
  
  return Array.from({ length: points }, (_, i) => {
    return generateDataPoint(now - (points - i) * interval);
  });
}

// SimulationManager handles the state for simulation
class SimulationManager {
  constructor() {
    this.updateInterval = 2000;
    this.intervalId = null;
    this.compressionResults = [];
    this.devices = generateDevices();
    this.historicalData = generateHistoricalData(30);
    this.totalDataSaved = Math.floor(10000 + Math.random() * 990000);
    this.totalDataProcessed = Math.floor(50000 + Math.random() * 950000);
    this.listeners = [];
    this.chart = null;
  }

  // Start simulation with live updates
  startSimulation(interval) {
    this.updateInterval = interval || this.updateInterval;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.updateSimulationData();
    }, this.updateInterval);
    
    // Initial update
    this.updateSimulationData();
  }
  
  // Stop simulation updates
  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  // Set new update interval
  setUpdateInterval(interval) {
    this.updateInterval = interval;
    if (this.intervalId) {
      this.stopSimulation();
      this.startSimulation();
    }
  }
  
  // Update all simulation data
  async updateSimulationData() {
    // Try to get real data from backend if connected
    let compressionData;
    try {
      compressionData = await compressionService.getCompressionResults();
      this.compressionResults = compressionData.results;
    } catch (error) {
      // Generate random compression results if backend fails
      this.compressionResults = [
        {
          algorithm: 'huffman',
          compressionRatio: randomCompressionRatio(),
          compressedSize: Math.floor(1000 * randomCompressionRatio())
        },
        {
          algorithm: 'delta',
          compressionRatio: randomCompressionRatio(),
          compressedSize: Math.floor(1000 * randomCompressionRatio())
        }
      ];
    }
    
    // Update devices occasionally
    if (Math.random() > 0.7) {
      this.devices = this.devices.map(device => ({
        ...device,
        status: Math.random() > 0.1 ? 'active' : 'inactive',
        dataRate: Math.floor(10 + Math.random() * 90),
        lastSeen: new Date().toISOString()
      }));
    }
    
    // Add new historical data point
    const newPoint = generateDataPoint(Date.now());
    this.historicalData = [...this.historicalData.slice(1), newPoint];
    
    // Update totals
    const newDataProcessed = Math.floor(1000 + Math.random() * 9000);
    const avgCompressionRatio = 0.4;
    const newDataSaved = Math.floor(newDataProcessed * avgCompressionRatio);
    
    this.totalDataProcessed += newDataProcessed;
    this.totalDataSaved += newDataSaved;
    
    // Notify all registered listeners
    this.notifyListeners();
  }
  
  // Add a listener for updates
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  // Remove a listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  // Notify all listeners of data updates
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        compressionResults: this.compressionResults,
        devices: this.devices,
        historicalData: this.historicalData,
        totalDataSaved: this.totalDataSaved,
        totalDataProcessed: this.totalDataProcessed,
        averageCompressionRatio: this.totalDataSaved / this.totalDataProcessed
      });
    });
  }
  
  // Get current simulation state
  getCurrentState() {
    return {
      compressionResults: this.compressionResults,
      devices: this.devices,
      historicalData: this.historicalData,
      totalDataSaved: this.totalDataSaved,
      totalDataProcessed: this.totalDataProcessed,
      averageCompressionRatio: this.totalDataSaved / this.totalDataProcessed
    };
  }
  
  // Initialize the chart with historical data
  initChart(chartElement) {
    const ctx = chartElement.getContext('2d');
    
    // Format dates for the chart
    const labels = this.historicalData.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    
    // Extract compression ratio data
    const huffmanData = this.historicalData.map(point => point.huffman * 100);
    const deltaData = this.historicalData.map(point => point.delta * 100);
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Huffman',
            data: huffmanData,
            borderColor: '#0369a1',
            backgroundColor: 'rgba(3, 105, 161, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Delta',
            data: deltaData,
            borderColor: '#7e22ce',
            backgroundColor: 'rgba(126, 34, 206, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Compression Ratio (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          }
        },
        plugins: {
          title: {
            display: false,
          },
          legend: {
            position: 'top',
          }
        }
      }
    });
  }
  
  // Update the chart with new data
  updateChart() {
    if (!this.chart) return;
    
    // Update labels with new timestamps
    const labels = this.historicalData.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    
    // Update compression data
    const huffmanData = this.historicalData.map(point => point.huffman * 100);
    const deltaData = this.historicalData.map(point => point.delta * 100);
    
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = huffmanData;
    this.chart.data.datasets[1].data = deltaData;
    
    this.chart.update();
  }
}

// Create simulation manager instance
const simulationManager = new SimulationManager();
