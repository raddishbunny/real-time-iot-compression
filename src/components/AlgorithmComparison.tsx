
import { motion } from 'framer-motion';
import { CompressionResult } from '@/lib/simulationData';

interface AlgorithmComparisonProps {
  compressionResults: CompressionResult[];
}

const AlgorithmComparison = ({ compressionResults }: AlgorithmComparisonProps) => {
  // Find the algorithm with the best compression ratio
  const bestAlgorithm = compressionResults.reduce(
    (best, current) => 
      current.compressionRatio > best.compressionRatio ? current : best,
    compressionResults[0]
  );
  
  // Find the algorithm with the fastest compression time
  const fastestAlgorithm = compressionResults.reduce(
    (fastest, current) => 
      current.compressionTime < fastest.compressionTime ? current : fastest,
    compressionResults[0]
  );
  
  const algorithmInfo = {
    huffman: {
      name: 'Huffman Coding',
      description: 'Variable-length prefix encoding based on frequency',
      bestFor: 'Text data with repetitive patterns',
      color: 'blue'
    },
    rle: {
      name: 'Run-Length Encoding',
      description: 'Simplifies consecutive data values',
      bestFor: 'Repetitive data sequences & simple images',
      color: 'green'
    },
    delta: {
      name: 'Delta Encoding',
      description: 'Stores differences between consecutive values',
      bestFor: 'Time-series & slowly changing data',
      color: 'purple'
    },
    lz77: {
      name: 'LZ77 Algorithm',
      description: 'Dictionary-based compression',
      bestFor: 'Text & mixed content with patterns',
      color: 'orange'
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium">Algorithm Performance</h3>
        <p className="text-sm text-muted-foreground">Comparing compression efficiency & speed</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-blue-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Most Efficient</p>
              <h4 className="text-lg font-bold mt-1 text-gray-800">
                {algorithmInfo[bestAlgorithm.algorithm].name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {(bestAlgorithm.compressionRatio * 100).toFixed(1)}% reduction
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-purple-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-purple-600">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600">Fastest Processing</p>
              <h4 className="text-lg font-bold mt-1 text-gray-800">
                {algorithmInfo[fastestAlgorithm.algorithm].name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {fastestAlgorithm.compressionTime.toFixed(2)}ms average
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {compressionResults.map((result) => {
          const info = algorithmInfo[result.algorithm];
          const ratio = result.compressionRatio * 100;
          
          return (
            <motion.div 
              key={result.algorithm}
              variants={item}
              className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full bg-${info.color}-500 mr-2`}></div>
                    <h4 className="font-medium text-gray-900">{info.name}</h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{info.description}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Compression</p>
                    <p className="text-sm font-bold">{ratio.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Processing Time</p>
                    <p className="text-sm font-bold">{result.compressionTime.toFixed(2)}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Best For</p>
                    <p className="text-sm font-medium">{info.bestFor}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className={`bg-${info.color}-500 h-1.5 rounded-full`}
                  style={{ 
                    width: `${ratio}%`,
                    backgroundColor: info.color === 'blue' ? '#3b82f6' : 
                                    info.color === 'green' ? '#10b981' : 
                                    info.color === 'purple' ? '#8b5cf6' : 
                                    '#f97316'
                  }}
                ></div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default AlgorithmComparison;
