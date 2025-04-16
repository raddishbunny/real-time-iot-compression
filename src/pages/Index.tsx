import { useState, useEffect } from 'react';
import { useCompressionData } from '@/lib/simulationData';
import { motion } from 'framer-motion';

import Header from '@/components/Header';
import CompressionStats from '@/components/CompressionStats';
import CompressionChart from '@/components/CompressionChart';
import DeviceList from '@/components/DeviceList';
import AlgorithmComparison from '@/components/AlgorithmComparison';
import SimulationControl from '@/components/SimulationControl';
import CustomDataCompression from '@/components/CustomDataCompression';

const Index = () => {
  const [updateInterval, setUpdateInterval] = useState(2000);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    compressionResults,
    devices,
    historicalData,
    totalDataSaved,
    totalDataProcessed,
    averageCompressionRatio
  } = useCompressionData(updateInterval);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <h2 className="text-xl font-medium text-foreground animate-pulse">
            Loading IoT Compression Dashboard
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container px-4 py-24 mx-auto max-w-7xl"
      >
        <div className="mb-12 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block chip mb-2">Real-Time IoT Analytics</div>
            <h1 className="text-4xl font-bold tracking-tight">Data Compression Dashboard</h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl">
              Monitor and analyze real-time compression efficiency for IoT device networks
            </p>
          </motion.div>
        </div>
        
        <div className="space-y-8">
          <CompressionStats 
            totalDataProcessed={totalDataProcessed}
            totalDataSaved={totalDataSaved}
            averageCompressionRatio={averageCompressionRatio}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CompressionChart data={historicalData} />
            </div>
            <div>
              <SimulationControl 
                updateInterval={updateInterval}
                onUpdateIntervalChange={setUpdateInterval}
              />
            </div>
          </div>
          
          <div id="algorithms" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AlgorithmComparison compressionResults={compressionResults} />
            <CustomDataCompression />
          </div>
          
          <div id="devices">
            <DeviceList devices={devices} />
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Index;
