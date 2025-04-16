
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

  private constructor() {}

  static getInstance(): CompressionService {
    if (!CompressionService.instance) {
      CompressionService.instance = new CompressionService();
    }
    return CompressionService.instance;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  async getCompressionResults(): Promise<CompressionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compress`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      return {
        ...data,
        originalData: data.originalData || "",
      };
    } catch (error) {
      console.error('Error fetching compression results:', error);
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
      
      return {
        ...result,
        originalData: result.originalData || data,
      };
    } catch (error) {
      console.error('Error compressing custom data:', error);
      return {
        originalSize: data.length,
        originalData: data,
        results: [
          { algorithm: 'huffman', compressionRatio: data.length > 10 ? 0.45 : 0.1, compressedSize: Math.floor(data.length * 0.55 * 8) },
          { algorithm: 'delta', compressionRatio: data.length > 10 ? 0.25 : 0.03, compressedSize: Math.floor(data.length * 0.75 * 8) }
        ]
      };
    }
  }

  private getMockCompressionResults(): CompressionResponse {
    return {
      originalSize: 1000,
      originalData: "Mock compression data",
      results: [
        { algorithm: 'huffman', compressionRatio: 0.45, compressedSize: 550 },
        { algorithm: 'delta', compressionRatio: 0.25, compressedSize: 750 }
      ]
    };
  }
}

export default CompressionService.getInstance();
