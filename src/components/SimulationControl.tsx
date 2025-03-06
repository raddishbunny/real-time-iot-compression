
import { useState } from 'react';
import { motion } from 'framer-motion';

interface SimulationControlProps {
  updateInterval: number;
  onUpdateIntervalChange: (interval: number) => void;
}

const SimulationControl = ({ 
  updateInterval, 
  onUpdateIntervalChange 
}: SimulationControlProps) => {
  const [isRunning, setIsRunning] = useState(true);
  const [sliderValue, setSliderValue] = useState(updateInterval / 1000);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setSliderValue(newValue);
    onUpdateIntervalChange(newValue * 1000);
  };
  
  const handlePlayPause = () => {
    if (isRunning) {
      // Pause simulation
      setIsRunning(false);
      onUpdateIntervalChange(0); // Use 0 to signal stopping the interval
    } else {
      // Resume simulation
      setIsRunning(true);
      onUpdateIntervalChange(sliderValue * 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium">Simulation Control</h3>
        <p className="text-sm text-muted-foreground">Adjust data generation settings</p>
      </div>
      
      <div className="flex flex-col space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="update-interval" className="text-sm font-medium">
              Update Interval
            </label>
            <span className="text-sm text-muted-foreground">{sliderValue}s</span>
          </div>
          <input
            id="update-interval"
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={sliderValue}
            onChange={handleSliderChange}
            disabled={!isRunning}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              {isRunning ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors text-sm font-medium">
              Connect C++
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
              Export Data
            </button>
          </div>
        </div>
        
        <div className="bg-secondary/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Simulation Status</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-sm">{isRunning ? 'Running' : 'Paused'}</span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="text-sm text-muted-foreground">
              Simulating {isRunning ? 'real-time' : 'paused'} data from {8} devices
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SimulationControl;
