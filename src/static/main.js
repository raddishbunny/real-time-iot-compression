
// Main JavaScript file for the IoT Compression Dashboard

// DOM elements
const elements = {
  updateInterval: document.getElementById('updateInterval'),
  updateIntervalValue: document.getElementById('updateIntervalValue'),
  cppBackendUrl: document.getElementById('cppBackendUrl'),
  connectBackendBtn: document.getElementById('connectBackendBtn'),
  connectionStatus: document.getElementById('connectionStatus'),
  totalDataProcessed: document.getElementById('totalDataProcessed'),
  totalDataSaved: document.getElementById('totalDataSaved'),
  avgCompressionRatio: document.getElementById('avgCompressionRatio'),
  compressionChart: document.getElementById('compressionChart'),
  algorithmComparisonContainer: document.getElementById('algorithmComparisonContainer'),
  customData: document.getElementById('customData'),
  compressBtn: document.getElementById('compressBtn'),
  customCompressionResults: document.getElementById('customCompressionResults'),
  originalSize: document.getElementById('originalSize'),
  customResultsList: document.getElementById('customResultsList'),
  deviceList: document.getElementById('deviceList'),
  themeToggle: document.getElementById('themeToggle'),
  toast: document.getElementById('toast')
};

// Show a toast message
function showToast(message, type = 'info', duration = 3000) {
  elements.toast.textContent = message;
  elements.toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    elements.toast.className = 'toast';
  }, duration);
}

// Update UI with simulation data
function updateUI(data) {
  // Update compression stats
  elements.totalDataProcessed.textContent = formatBytes(data.totalDataProcessed);
  elements.totalDataSaved.textContent = formatBytes(data.totalDataSaved);
  elements.avgCompressionRatio.textContent = `${(data.averageCompressionRatio * 100).toFixed(1)}%`;
  
  // Update algorithm comparison
  updateAlgorithmComparison(data.compressionResults);
  
  // Update devices list
  updateDeviceList(data.devices);
  
  // Update chart
  simulationManager.updateChart();
}

// Update algorithm comparison section
function updateAlgorithmComparison(results) {
  if (!results || results.length === 0) return;
  
  elements.algorithmComparisonContainer.innerHTML = '';
  
  results.forEach(result => {
    const container = document.createElement('div');
    container.className = 'progress-container';
    
    const ratio = Math.min(100, Math.round(result.compressionRatio * 100));
    
    container.innerHTML = `
      <div class="progress-header">
        <span class="text-sm font-medium capitalize">${result.algorithm}</span>
        <span class="text-sm">${ratio}% reduction</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${ratio}%"></div>
      </div>
      <div class="text-xs mt-1">
        Compressed size: ${formatBytes(result.compressedSize)}
      </div>
    `;
    
    elements.algorithmComparisonContainer.appendChild(container);
  });
}

// Update device list section
function updateDeviceList(devices) {
  if (!devices || devices.length === 0) return;
  
  elements.deviceList.innerHTML = '';
  
  devices.forEach(device => {
    const deviceEl = document.createElement('div');
    deviceEl.className = 'device-card';
    
    deviceEl.innerHTML = `
      <div class="device-header">
        <div class="device-name">${device.name}</div>
        <div class="device-status ${device.status}">${device.status}</div>
      </div>
      <div class="device-details">
        <div class="device-detail">Type: ${device.type}</div>
        <div class="device-detail">Data rate: ${device.dataRate} KB/s</div>
        <div class="device-detail">Last seen: ${formatDate(device.lastSeen)}</div>
      </div>
    `;
    
    elements.deviceList.appendChild(deviceEl);
  });
}

// Format date to readable format
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
}

// Connect to C++ backend
async function connectToBackend() {
  const url = elements.cppBackendUrl.value.trim();
  
  if (!url) {
    showToast('Please enter a valid backend URL', 'error');
    return;
  }
  
  compressionService.setBaseUrl(url);
  
  // Show connecting status
  elements.connectionStatus.textContent = 'Connecting...';
  elements.connectionStatus.className = 'chip';
  elements.connectBackendBtn.disabled = true;
  
  try {
    const connected = await compressionService.testConnection();
    
    if (connected) {
      elements.connectionStatus.textContent = 'Connected';
      elements.connectionStatus.className = 'chip connected';
      showToast('Successfully connected to C++ backend', 'success');
    } else {
      elements.connectionStatus.textContent = 'Disconnected';
      elements.connectionStatus.className = 'chip disconnected';
      showToast('Failed to connect to C++ backend', 'error');
    }
  } catch (error) {
    console.error('Connection error:', error);
    elements.connectionStatus.textContent = 'Error';
    elements.connectionStatus.className = 'chip disconnected';
    showToast(`Connection error: ${error.message}`, 'error');
  }
  
  elements.connectBackendBtn.disabled = false;
}

// Handle custom data compression
async function compressCustomData() {
  const data = elements.customData.value.trim();
  
  if (!data) {
    showToast('Please enter data to compress', 'error');
    return;
  }
  
  try {
    elements.compressBtn.disabled = true;
    elements.compressBtn.textContent = 'Compressing...';
    
    const result = await compressionService.compressCustomData(data);
    
    // Update UI with results
    elements.originalSize.textContent = formatBytes(result.originalSize);
    
    // Clear previous results
    elements.customResultsList.innerHTML = '';
    
    // Add each algorithm result
    result.results.forEach(algo => {
      const resultEl = document.createElement('div');
      resultEl.className = 'progress-container';
      
      const ratio = Math.min(100, Math.round(algo.compressionRatio * 100));
      
      resultEl.innerHTML = `
        <div class="progress-header">
          <span class="text-sm font-medium capitalize">${algo.algorithm}</span>
          <span class="text-sm">${ratio}% reduction</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${ratio}%"></div>
        </div>
        <div class="text-xs mt-1">
          Compressed size: ${formatBytes(algo.compressedSize)}
        </div>
      `;
      
      elements.customResultsList.appendChild(resultEl);
    });
    
    // Show results container
    elements.customCompressionResults.classList.remove('hidden');
    
  } catch (error) {
    console.error('Compression error:', error);
    showToast(`Compression error: ${error.message}`, 'error');
  } finally {
    elements.compressBtn.disabled = false;
    elements.compressBtn.textContent = 'Compress Data';
  }
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark', elements.themeToggle.checked);
  
  // Save preference
  localStorage.setItem('darkMode', elements.themeToggle.checked ? 'true' : 'false');
}

// Initialize the application
function init() {
  // Set up event listeners
  elements.updateInterval.addEventListener('input', () => {
    const value = elements.updateInterval.value;
    elements.updateIntervalValue.textContent = `${value} ms`;
    simulationManager.setUpdateInterval(parseInt(value));
  });
  
  elements.connectBackendBtn.addEventListener('click', connectToBackend);
  elements.compressBtn.addEventListener('click', compressCustomData);
  elements.themeToggle.addEventListener('change', toggleDarkMode);
  
  // Check dark mode preference
  const darkMode = localStorage.getItem('darkMode') === 'true';
  elements.themeToggle.checked = darkMode;
  document.body.classList.toggle('dark', darkMode);
  
  // Initialize simulation
  simulationManager.addListener(updateUI);
  
  // Initialize chart
  simulationManager.initChart(elements.compressionChart);
  
  // Start simulation
  simulationManager.startSimulation();
  
  // Set initial update interval value display
  elements.updateIntervalValue.textContent = `${elements.updateInterval.value} ms`;
  
  // Check if backend connection is available
  connectToBackend();
}

// Initialize when DOM content is loaded
document.addEventListener('DOMContentLoaded', init);
