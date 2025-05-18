
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

  private constructor() {}

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
  }

  private calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    // Ensure ratio is between 0 and 1
    const ratio = Math.max(0, Math.min(1, 1 - (compressedSize / originalSize)));
    return Math.round(ratio * 100) / 100; // Round to 2 decimal places
  }

  async getCompressionResults(): Promise<CompressionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compress`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Update results with bounded compression ratio
      const results = data.results.map((result: CompressionResult) => ({
        ...result,
        compressionRatio: this.calculateCompressionRatio(
          data.originalSize, 
          result.compressedSize
        )
      }));
      
      this._isConnected = true;
      
      return {
        ...data,
        results,
        originalData: data.originalData || "",
      };
    } catch (error) {
      console.error('Error fetching compression results:', error);
      this._isConnected = false;
      return this.getMockCompressionResults();
    }
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
      
      // Let the component handle mock data generation instead
      throw error;
    }
  }

  private getMockCompressionResults(): CompressionResponse {
    const originalSize = 1000;
    return {
      originalSize,
      originalData: "Mock compression data",
      results: [
        { 
          algorithm: 'huffman', 
          compressionRatio: 0.45, 
          compressedSize: 550 
        },
        { 
          algorithm: 'delta', 
          compressionRatio: 0.25, 
          compressedSize: 750 
        }
      ]
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      if (response.ok) {
        this._isConnected = true;
        return true;
      } else {
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
