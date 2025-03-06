
/**
 * Service to communicate with the C++ compression backend
 */
export interface CompressionResult {
  algorithm: string;
  compressionRatio: number;
  compressedSize: number;
}

interface CompressionResponse {
  originalSize: number;
  results: CompressionResult[];
  originalData?: string;
}

export class CompressionService {
  private static instance: CompressionService;
  private baseUrl: string = 'http://localhost:8081';

  private constructor() {}

  static getInstance(): CompressionService {
    if (!CompressionService.instance) {
      CompressionService.instance = new CompressionService();
    }
    return CompressionService.instance;
  }

  /**
   * Set the base URL for the compression API
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get compression results from the C++ backend
   */
  async getCompressionResults(): Promise<CompressionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compress`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching compression results:', error);
      // Return mock data if the C++ server is not available
      return this.getMockCompressionResults();
    }
  }

  /**
   * Send custom data to the C++ backend for compression
   */
  async compressCustomData(data: string): Promise<CompressionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compress/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error compressing custom data:', error);
      // Return mock data if the C++ server is not available
      return {
        ...this.getMockCompressionResults(),
        originalData: data
      };
    }
  }

  /**
   * Get mock compression results (fallback)
   */
  private getMockCompressionResults(): CompressionResponse {
    return {
      originalSize: 1000,
      results: [
        { algorithm: 'huffman', compressionRatio: 0.45, compressedSize: 550 },
        { algorithm: 'rle', compressionRatio: 0.30, compressedSize: 700 },
        { algorithm: 'delta', compressionRatio: 0.25, compressedSize: 750 },
        { algorithm: 'lz77', compressionRatio: 0.42, compressedSize: 580 }
      ]
    };
  }
}

export default CompressionService.getInstance();
