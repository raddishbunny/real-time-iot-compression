
import { motion } from 'framer-motion';
import { formatBytes } from '@/lib/simulationData';

interface CompressionStatsProps {
  totalDataProcessed: number;
  totalDataSaved: number;
  averageCompressionRatio: number;
}

const CompressionStats = ({ 
  totalDataProcessed, 
  totalDataSaved, 
  averageCompressionRatio 
}: CompressionStatsProps) => {
  
  const stats = [
    {
      name: 'Total Data Processed',
      value: formatBytes(totalDataProcessed),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-primary">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
          <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
        </svg>
      )
    },
    {
      name: 'Data Saved',
      value: formatBytes(totalDataSaved),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-green-500">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    },
    {
      name: 'Compression Ratio',
      value: `${(averageCompressionRatio * 100).toFixed(1)}%`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-blue-500">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="stat-card hover:translate-y-[-2px]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <h3 className="mt-2 text-3xl font-bold">{stat.value}</h3>
            </div>
            <div className="p-2 rounded-full bg-primary/10">
              {stat.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CompressionStats;
