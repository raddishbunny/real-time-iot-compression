
import { motion } from 'framer-motion';
import { Device } from '@/lib/simulationData';

interface DeviceListProps {
  devices: Device[];
}

const DeviceList = ({ devices }: DeviceListProps) => {
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
        <h3 className="text-lg font-medium">IoT Devices</h3>
        <p className="text-sm text-muted-foreground">Connected devices and their status</p>
      </div>
      
      <div className="overflow-x-auto">
        <motion.table 
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full"
        >
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Device</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Type</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Data Rate</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <motion.tr key={device.id} variants={item} className="hover:bg-secondary/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${device.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">{device.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="chip">{device.type}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    device.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {device.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <span className="font-medium">{device.dataRate}</span>
                    <span className="ml-1 text-muted-foreground text-xs">KB/s</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {new Date(device.lastSeen).toLocaleTimeString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>
    </motion.div>
  );
};

export default DeviceList;
