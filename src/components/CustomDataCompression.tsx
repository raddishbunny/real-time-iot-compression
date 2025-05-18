
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import CompressionService, { CompressionResponse } from '@/services/CompressionService';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';

type CustomCompressionResult = CompressionResponse;

const CustomDataCompression = () => {
  const [userData, setUserData] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CustomCompressionResult | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  // Check backend connection status periodically
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await CompressionService.testConnection();
      setIsBackendConnected(connected);
    };
    
    // Initial connection check
    checkConnection();
    
    // Set up interval for periodic checks
    const connectionInterval = setInterval(checkConnection, 5000);
    
    return () => {
      clearInterval(connectionInterval);
    };
  }, []);

  const handleCompression = async () => {
    if (!userData.trim()) {
      toast({
        title: "Empty Data",
        description: "Please enter some data to compress",
        variant: "destructive",
      });
      return;
    }

    setIsCompressing(true);
    
    try {
      // Clear previous results
      setCompressionResult(null);
      
      console.log("Attempting to compress data with backend...");
      // Always attempt to use the backend service
      const result = await CompressionService.compressCustomData(userData);
      console.log("Compression result:", result);
      
      setCompressionResult(result);
      setIsBackendConnected(true); // Update connection status on successful request
      
      toast({
        title: "Compression Complete",
        description: "Data has been compressed successfully using the C++ backend",
      });
      
    } catch (error) {
      console.error('Error compressing data:', error);
      setIsBackendConnected(false); // Update connection status on failed request
      
      toast({
        title: "Compression Failed",
        description: "Could not compress data. Backend may be unavailable.",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Code size={20} className="text-primary" />
          Custom Data Compression
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter your own data to see how different compression algorithms perform
        </p>
      </div>

      <div className="space-y-6">
        <Textarea
          placeholder="Enter data to compress (text, patterns, etc.)"
          value={userData}
          onChange={(e) => setUserData(e.target.value)}
          className="min-h-32 font-mono text-sm"
        />
        
        <div className="flex flex-col space-y-2">
          <div className={`flex items-center gap-2 text-sm ${isBackendConnected ? 'text-green-600' : 'text-yellow-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span>
              {isBackendConnected === null ? 'Checking backend connection...' : 
               isBackendConnected ? 'Connected to C++ backend' : 
               'Attempting to connect to backend...'}
            </span>
          </div>
          
          <Button 
            onClick={handleCompression} 
            disabled={isCompressing || !userData.trim()}
            className="w-full"
          >
            {isCompressing ? 'Compressing...' : 'Compress Data'}
          </Button>
        </div>

        {compressionResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-md">Compression Results</CardTitle>
              {isBackendConnected && (
                <div className="text-xs text-green-500">
                  ✓ Using C++ compression engine
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 bg-secondary/30 rounded">
                  <span className="text-sm font-medium">Original Size</span>
                  <span className="text-sm">{compressionResult.originalSize} bytes</span>
                </div>
                
                {compressionResult.results.map((result, index) => (
                  <div key={index} className="p-2 border border-border rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">{result.algorithm}</span>
                      <span className="text-sm font-mono">
                        {Math.min(100, Math.round(result.compressionRatio * 100))}% reduction
                      </span>
                    </div>
                    <div className="w-full bg-secondary/30 h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (1 - result.compressionRatio) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Compressed size: {result.compressedSize} bits
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Results from C++ compression engine
            </CardFooter>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default CustomDataCompression;
