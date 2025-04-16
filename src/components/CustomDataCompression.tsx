
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import CompressionService from '@/services/CompressionService';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';

export interface CustomCompressionResult {
  originalSize: number;
  originalData: string;
  results: {
    algorithm: string;
    compressionRatio: number;
    compressedSize: number;
  }[];
}

const CustomDataCompression = () => {
  const [userData, setUserData] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CustomCompressionResult | null>(null);

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
      const result = await CompressionService.compressCustomData(userData);
      setCompressionResult(result);
      toast({
        title: "Compression Complete",
        description: "Data has been compressed successfully",
      });
    } catch (error) {
      console.error('Error compressing data:', error);
      toast({
        title: "Compression Failed",
        description: "Failed to compress data. Make sure the C++ backend server is running.",
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
                        {(result.compressionRatio * 100).toFixed(1)}% reduction
                      </span>
                    </div>
                    <div className="w-full bg-secondary/30 h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(1 - result.compressionRatio) * 100}%` }}
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
              Results may vary based on data patterns and content
            </CardFooter>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default CustomDataCompression;
