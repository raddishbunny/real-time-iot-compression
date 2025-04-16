
import { useState, useEffect, useRef } from 'react';

export type Algorithm = 'huffman' | 'rle' | 'delta' | 'lz77';

export interface CompressionResult {
  algorithm: Algorithm;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressionTime: number;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  dataRate: number;
  lastSeen: string;
}

export interface CompressionDataPoint {
  timestamp: number;
  huffman: number;
  rle: number;
  delta: number;
  lz77: number;
  dataSize: number;
}

const ALGORITHMS: Algorithm[] = ['huffman', 'rle', 'delta', 'lz77'];

// Generate a random compression value between 0.1 and 0.9
const randomCompressionRatio = () => 0.1 + Math.random() * 0.8;

// Generate random compression time between 1ms and 20ms
const randomCompressionTime = () => 1 + Math.random() * 19;

// Generate sample devices
export const generateDevices = (): Device[] => {
  const deviceTypes = ['Sensor', 'Controller', 'Gateway', 'Camera'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `device-${i + 1}`,
    name: `IoT ${deviceTypes[i % deviceTypes.length]} ${i + 1}`,
    type: deviceTypes[i % deviceTypes.length],
    status: Math.random() > 0.2 ? 'active' : 'inactive',
    dataRate: Math.floor(10 + Math.random() * 90),
    lastSeen: new Date(Date.now() - Math.floor(Math.random() * 60000)).toISOString()
  }));
};

// Generate a random data sample for simulation
export const generateCompressionResult = (algorithm: Algorithm): CompressionResult => {
  const originalSize = 1000 + Math.floor(Math.random() * 9000);
  const ratio = randomCompressionRatio();
  const compressedSize = Math.floor(originalSize * ratio);
  
  return {
    algorithm,
    originalSize,
    compressedSize,
    compressionRatio: 1 - ratio,
    compressionTime: randomCompressionTime()
  };
};

// Generate historical data points
export const generateHistoricalData = (points: number): CompressionDataPoint[] => {
  const now = Date.now();
  const interval = 60000; // 1 minute interval
  
  return Array.from({ length: points }, (_, i) => {
    const dataSize = 1000 + Math.random() * 9000;
    return {
      timestamp: now - (points - i) * interval,
      huffman: 1 - (0.2 + Math.random() * 0.3),
      rle: 1 - (0.4 + Math.random() * 0.3),
      delta: 1 - (0.3 + Math.random() * 0.3),
      lz77: 1 - (0.25 + Math.random() * 0.25),
      dataSize
    };
  });
};

// Custom hook for simulating real-time compression data
export const useCompressionData = (updateInterval = 2000) => {
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>(
    ALGORITHMS.map(generateCompressionResult)
  );
  
  const [devices, setDevices] = useState<Device[]>(generateDevices());
  
  const [historicalData, setHistoricalData] = useState<CompressionDataPoint[]>(
    generateHistoricalData(30)
  );
  
  const [totalDataSaved, setTotalDataSaved] = useState<number>(
    Math.floor(10000 + Math.random() * 990000)
  );
  
  const [totalDataProcessed, setTotalDataProcessed] = useState<number>(
    Math.floor(50000 + Math.random() * 950000)
  );

  // Reference to the interval ID
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous interval if it exists
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Only set a new interval if updateInterval is greater than 0
    if (updateInterval > 0) {
      intervalRef.current = window.setInterval(() => {
        // Update compression results
        setCompressionResults(ALGORITHMS.map(generateCompressionResult));
        
        // Update devices occasionally
        if (Math.random() > 0.7) {
          setDevices(prevDevices => 
            prevDevices.map(device => ({
              ...device,
              status: Math.random() > 0.1 ? 'active' : 'inactive',
              dataRate: Math.floor(10 + Math.random() * 90),
              lastSeen: new Date().toISOString()
            }))
          );
        }
        
        // Add new historical data point
        setHistoricalData(prev => {
          const newPoint = {
            timestamp: Date.now(),
            huffman: 1 - (0.2 + Math.random() * 0.3),
            rle: 1 - (0.4 + Math.random() * 0.3),
            delta: 1 - (0.3 + Math.random() * 0.3),
            lz77: 1 - (0.25 + Math.random() * 0.25),
            dataSize: 1000 + Math.random() * 9000
          };
          return [...prev.slice(1), newPoint];
        });
        
        // Update totals
        const newDataProcessed = Math.floor(1000 + Math.random() * 9000);
        const avgCompressionRatio = 0.4;
        const newDataSaved = Math.floor(newDataProcessed * avgCompressionRatio);
        
        setTotalDataProcessed(prev => prev + newDataProcessed);
        setTotalDataSaved(prev => prev + newDataSaved);
      }, updateInterval);
    }
    
    // Cleanup on unmount or when updateInterval changes
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [updateInterval]); // Only dependending on updateInterval
  
  return {
    compressionResults,
    devices,
    historicalData,
    totalDataSaved,
    totalDataProcessed,
    averageCompressionRatio: totalDataSaved / totalDataProcessed
  };
};

// Format bytes to human-readable format
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
