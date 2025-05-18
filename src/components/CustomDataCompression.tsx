import { useState } from 'react';
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

  // Generate mock compression results based on actual input data
  const generateInputBasedCompressionResults = (input: string) => {
    const originalSize = input.length;
    
    // Calculate realistic compression ratios based on input patterns
    let huffmanRatio = 0.2; // Default ratio
    let deltaRatio = 0.1; // Default ratio
    
    // Adjust ratios based on input characteristics
    if (input.length > 0) {
      // Check for repeating patterns
      const repeatingChars = new Set(input).size / input.length;
      
      // Lower ratio (better compression) for more repetitive content
      if (repeatingChars < 0.3) {
        huffmanRatio = 0.6; // 60% reduction
        deltaRatio = 0.45; // 45% reduction
      } else if (repeatingChars < 0.5) {
        huffmanRatio = 0.4; // 40% reduction
        deltaRatio = 0.3; // 30% reduction
      } else {
        huffmanRatio = 0.25; // 25% reduction
        deltaRatio = 0.15; // 15% reduction
      }
      
      // Adjust for numeric content which delta encoding handles well
      const numericContent = (input.match(/[0-9]/g) || []).length / input.length;
      if (numericContent > 0.5) {
        deltaRatio += 0.2; // Delta works better on numeric data
      }
    }
    
    return {
      originalSize,
      originalData: input,
      results: [
        { 
          algorithm: 'huffman', 
          compressionRatio: huffmanRatio, 
          compressedSize: Math.floor(originalSize * (1 - huffmanRatio) * 8) 
        },
        { 
          algorithm: 'delta', 
          compressionRatio: deltaRatio, 
          compressedSize: Math.floor(originalSize * (1 - deltaRatio) * 8) 
        }
      ]
    };
  };

  // Test backend connection on component mount
  const testBackendConnection = async () => {
    try {
      const isConnected = await CompressionService.testConnection();
      setIsBackendConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Failed to test backend connection:', error);
      setIsBackendConnected(false);
      return false;
    }
  };

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
    
    // Test connection if we haven't already
    if (isBackendConnected === null) {
      await testBackendConnection();
    }
    
    try {
      // Clear previous results
      setCompressionResult(null);
      
      // Attempt to use the backend service
      const result = await CompressionService.compressCustomData(userData);
      setCompressionResult(result);
      
      toast({
        title: "Compression Complete",
        description: "Data has been compressed successfully",
      });
      
    } catch (error) {
      console.error('Error compressing data:', error);
      
      // Use our custom mock generator on error
      const mockResult = generateInputBasedCompressionResults(userData);
      setCompressionResult(mockResult);
      
      toast({
        title: "Using Simulation Mode",
        description: "Couldn't connect to C++ backend. Using simulation data instead.",
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
        
        <Button 
          onClick={handleCompression} 
          disabled={isCompressing || !userData.trim()}
          className="w-full"
        >
          {isCompressing ? 'Compressing...' : 'Compress Data'}
        </Button>

        {compressionResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-md">Compression Results</CardTitle>
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
              {isBackendConnected === true 
                ? "Results from C++ compression engine" 
                : "Simulation results (C++ backend not connected)"}
            </CardFooter>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default CustomDataCompression;
