
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { CompressionDataPoint, Algorithm } from '@/lib/simulationData';

interface CompressionChartProps {
  data: CompressionDataPoint[];
}

const CompressionChart = ({ data }: CompressionChartProps) => {
  const [activeAlgorithms, setActiveAlgorithms] = useState<Set<Algorithm>>(
    new Set(['huffman', 'rle', 'delta', 'lz77'])
  );
  
  const toggleAlgorithm = (algorithm: Algorithm) => {
    const newActiveAlgorithms = new Set(activeAlgorithms);
    if (newActiveAlgorithms.has(algorithm)) {
      newActiveAlgorithms.delete(algorithm);
    } else {
      newActiveAlgorithms.add(algorithm);
    }
    setActiveAlgorithms(newActiveAlgorithms);
  };
  
  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium mb-2">
            {new Date(label).toLocaleTimeString()}
          </p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between mb-1">
              <span style={{ color: entry.color }} className="text-xs font-medium mr-4">
                {entry.name}:
              </span>
              <span className="text-xs font-bold">
                {(entry.value * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const algorithmColors = {
    huffman: '#0ea5e9',
    rle: '#84cc16',
    delta: '#8b5cf6',
    lz77: '#f97316'
  };
  
  // Map algorithm names to display names
  const algorithmNames = {
    huffman: 'Huffman',
    rle: 'Run-Length',
    delta: 'Delta',
    lz77: 'LZ77'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full glass-panel rounded-xl p-6"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Compression Efficiency</h3>
          <p className="text-sm text-muted-foreground">Real-time compression ratio by algorithm</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          {(['huffman', 'rle', 'delta', 'lz77'] as Algorithm[]).map(algorithm => (
            <button
              key={algorithm}
              onClick={() => toggleAlgorithm(algorithm)}
              className={`chip transition-all duration-300 ${
                activeAlgorithms.has(algorithm)
                  ? `bg-${algorithmColors[algorithm]}/20 text-${algorithmColors[algorithm]}`
                  : 'bg-gray-100 text-gray-400'
              }`}
              style={{
                backgroundColor: activeAlgorithms.has(algorithm) 
                  ? `${algorithmColors[algorithm]}20` 
                  : '',
                color: activeAlgorithms.has(algorithm) 
                  ? algorithmColors[algorithm] 
                  : ''
              }}
            >
              {algorithmNames[algorithm]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis} 
              tickMargin={10}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              domain={[0, 1]}
              tickMargin={10}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {Object.entries(algorithmNames).map(([key, name]) => {
              const algorithm = key as Algorithm;
              return activeAlgorithms.has(algorithm) ? (
                <Line
                  key={algorithm}
                  type="monotone"
                  dataKey={algorithm}
                  name={name}
                  stroke={algorithmColors[algorithm]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                />
              ) : null;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default CompressionChart;
