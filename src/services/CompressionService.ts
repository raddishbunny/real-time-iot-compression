
/**
 * Service to communicate with the C++ compression backend
 */
export interface CompressionResult {
  algorithm: string;
  compressionRatio: number;
  compressedSize: number;
}

export interface CompressionResponse {
  originalSize: number;
  results: CompressionResult[];
  originalData: string;
}

export class CompressionService {
  private static instance: CompressionService;
  private baseUrl: string = 'http://localhost:8081';
  private _isConnected: boolean = false;

  private constructor() {
    // Initialize any properties here
  }

  static getInstance(): CompressionService {
    if (!CompressionService.instance) {
      CompressionService.instance = new CompressionService();
    }
    return CompressionService.instance;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
    console.log(`Base URL set to: ${this.baseUrl}`);
  }

  private calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    // Ensure ratio is between 0 and 1
    const ratio = Math.max(0, Math.min(1, 1 - (compressedSize / originalSize)));
    return Math.round(ratio * 100) / 100; // Round to 2 decimal places
  }

  async compressCustomData(data: string): Promise<CompressionResponse> {
    try {
      console.log(`Sending data to ${this.baseUrl}/api/compress/custom:`, { data });
      
      const response = await fetch(`${this.baseUrl}/api/compress/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server returned error:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Received compression result:', result);
      
      // Update results with bounded compression ratio
      const results = result.results.map((res: CompressionResult) => ({
        ...res,
        compressionRatio: this.calculateCompressionRatio(
          result.originalSize, 
          res.compressedSize
        )
      }));
      
      this._isConnected = true;
      
      return {
        ...result,
        results,
        originalData: result.originalData || data,
      };
    } catch (error) {
      console.error('Error compressing custom data:', error);
      this._isConnected = false;
      
      // Don't generate mock data here, just throw the error
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log(`Testing connection to ${this.baseUrl}`);
      const response = await fetch(`${this.baseUrl}/`, {
        // Adding a timeout to prevent long-hanging requests
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        console.log('Backend connection successful');
        this._isConnected = true;
        return true;
      } else {
        console.log('Backend connection failed: server returned an error');
        this._isConnected = false;
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      this._isConnected = false;
      return false;
    }
  }
}

export default CompressionService.getInstance();
