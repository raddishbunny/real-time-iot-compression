
#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <unordered_map>
#include <fstream>
#include <algorithm>
#include <chrono>

// Huffman Coding implementation
namespace Huffman {
    // Huffman Tree Node
    struct Node {
        char character;
        int frequency;
        Node* left;
        Node* right;
        
        Node(char character, int frequency) : 
            character(character), 
            frequency(frequency), 
            left(nullptr), 
            right(nullptr) {}
        
        ~Node() {
            delete left;
            delete right;
        }
    };
    
    // Compare nodes for priority queue
    struct CompareNodes {
        bool operator()(Node* left, Node* right) {
            return left->frequency > right->frequency;
        }
    };
    
    // Generate frequency map
    std::unordered_map<char, int> calculateFrequency(const std::string& data) {
        std::unordered_map<char, int> frequencies;
        for (char c : data) {
            frequencies[c]++;
        }
        return frequencies;
    }
    
    // Build Huffman tree
    Node* buildHuffmanTree(const std::unordered_map<char, int>& frequencies) {
        std::priority_queue<Node*, std::vector<Node*>, CompareNodes> minHeap;
        
        // Create leaf nodes and add to min heap
        for (const auto& pair : frequencies) {
            minHeap.push(new Node(pair.first, pair.second));
        }
        
        // Build Huffman tree by combining nodes
        while (minHeap.size() > 1) {
            Node* left = minHeap.top();
            minHeap.pop();
            
            Node* right = minHeap.top();
            minHeap.pop();
            
            Node* parent = new Node('\0', left->frequency + right->frequency);
            parent->left = left;
            parent->right = right;
            
            minHeap.push(parent);
        }
        
        return minHeap.top();
    }
    
    // Generate Huffman codes from tree
    void generateCodes(Node* root, const std::string& currentCode, 
                     std::unordered_map<char, std::string>& codes) {
        if (!root) {
            return;
        }
        
        // Found a leaf node
        if (!root->left && !root->right) {
            codes[root->character] = currentCode;
        }
        
        // Traverse left with '0'
        generateCodes(root->left, currentCode + '0', codes);
        
        // Traverse right with '1'
        generateCodes(root->right, currentCode + '1', codes);
    }
    
    // Compress data using Huffman coding
    std::pair<std::string, double> compress(const std::string& data) {
        auto startTime = std::chrono::high_resolution_clock::now();
        
        if (data.empty()) {
            return {"", 0.0};
        }
        
        // Calculate frequency of each character
        std::unordered_map<char, int> frequencies = calculateFrequency(data);
        
        // Build Huffman tree
        Node* root = buildHuffmanTree(frequencies);
        
        // Generate Huffman codes
        std::unordered_map<char, std::string> codes;
        generateCodes(root, "", codes);
        
        // Encode the data
        std::string encodedData;
        for (char c : data) {
            encodedData += codes[c];
        }
        
        auto endTime = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count();
        
        // Calculate compression ratio
        double originalSize = data.size() * 8; // in bits
        double compressedSize = encodedData.size(); // in bits
        double compressionRatio = 1.0 - (compressedSize / originalSize);
        
        // Clean up the tree
        delete root;
        
        return {encodedData, compressionRatio};
    }
}

// Run-Length Encoding implementation
namespace RLE {
    std::pair<std::string, double> compress(const std::string& data) {
        auto startTime = std::chrono::high_resolution_clock::now();
        
        if (data.empty()) {
            return {"", 0.0};
        }
        
        std::string encodedData;
        int count = 1;
        
        for (size_t i = 1; i < data.size(); i++) {
            if (data[i] == data[i - 1]) {
                count++;
            } else {
                encodedData += std::to_string(count) + data[i - 1];
                count = 1;
            }
        }
        
        // Add the last character
        encodedData += std::to_string(count) + data.back();
        
        auto endTime = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count();
        
        // Calculate compression ratio
        double originalSize = data.size() * 8; // in bits
        double compressedSize = encodedData.size() * 8; // in bits
        double compressionRatio = 1.0 - (compressedSize / originalSize);
        
        return {encodedData, compressionRatio};
    }
}

// Delta Encoding implementation
namespace Delta {
    std::pair<std::string, double> compress(const std::string& data) {
        auto startTime = std::chrono::high_resolution_clock::now();
        
        if (data.empty()) {
            return {"", 0.0};
        }
        
        std::string encodedData;
        encodedData.push_back(data[0]); // First character as is
        
        for (size_t i = 1; i < data.size(); i++) {
            // Calculate difference between consecutive characters
            char delta = data[i] - data[i - 1];
            encodedData.push_back(delta);
        }
        
        auto endTime = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count();
        
        // Calculate compression ratio
        double originalSize = data.size() * 8; // in bits
        double compressedSize = encodedData.size() * 8; // in bits
        double compressionRatio = 1.0 - (compressedSize / originalSize);
        
        return {encodedData, compressionRatio};
    }
}

// LZ77 Compression implementation
namespace LZ77 {
    std::pair<std::string, double> compress(const std::string& data) {
        auto startTime = std::chrono::high_resolution_clock::now();
        
        if (data.empty()) {
            return {"", 0.0};
        }
        
        // Simple LZ77 implementation
        const int MAX_WINDOW_SIZE = 255;
        const int MAX_LOOKAHEAD_SIZE = 15;
        
        std::string encodedData;
        
        size_t pos = 0;
        while (pos < data.size()) {
            // Calculate search window boundaries
            size_t windowStart = (pos > MAX_WINDOW_SIZE) ? pos - MAX_WINDOW_SIZE : 0;
            size_t lookaheadEnd = std::min(pos + MAX_LOOKAHEAD_SIZE, data.size());
            
            // Find longest match in window
            size_t bestMatchLength = 0;
            size_t bestMatchOffset = 0;
            
            for (size_t i = windowStart; i < pos; i++) {
                size_t matchLength = 0;
                while (pos + matchLength < lookaheadEnd && 
                      data[i + matchLength] == data[pos + matchLength] && 
                      matchLength < MAX_LOOKAHEAD_SIZE) {
                    matchLength++;
                }
                
                if (matchLength > bestMatchLength) {
                    bestMatchLength = matchLength;
                    bestMatchOffset = pos - i;
                }
            }
            
            if (bestMatchLength > 2) { // If match is long enough to save space
                // Output (offset, length, next char)
                encodedData.push_back('<');
                encodedData += std::to_string(bestMatchOffset) + "," + 
                               std::to_string(bestMatchLength) + ">";
                pos += bestMatchLength;
            } else {
                // Output literal character
                encodedData.push_back(data[pos]);
                pos++;
            }
        }
        
        auto endTime = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count();
        
        // Calculate compression ratio
        double originalSize = data.size() * 8; // in bits
        double compressedSize = encodedData.size() * 8; // in bits
        double compressionRatio = 1.0 - (compressedSize / originalSize);
        
        return {encodedData, compressionRatio};
    }
}

// Main function to run compression benchmarks
void runCompressionBenchmark(const std::string& inputData) {
    // Run all algorithms and compare
    auto resultHuffman = Huffman::compress(inputData);
    auto resultRLE = RLE::compress(inputData);
    auto resultDelta = Delta::compress(inputData);
    auto resultLZ77 = LZ77::compress(inputData);
    
    // Output results
    std::cout << "Input size: " << inputData.size() << " bytes" << std::endl;
    std::cout << "Huffman: " << (resultHuffman.second * 100) << "% reduction" << std::endl;
    std::cout << "RLE: " << (resultRLE.second * 100) << "% reduction" << std::endl;
    std::cout << "Delta: " << (resultDelta.second * 100) << "% reduction" << std::endl;
    std::cout << "LZ77: " << (resultLZ77.second * 100) << "% reduction" << std::endl;
    
    // Output compressed sizes
    std::cout << "Huffman compressed size: " << resultHuffman.first.size() << " bits" << std::endl;
    std::cout << "RLE compressed size: " << resultRLE.first.size() * 8 << " bits" << std::endl;
    std::cout << "Delta compressed size: " << resultDelta.first.size() * 8 << " bits" << std::endl;
    std::cout << "LZ77 compressed size: " << resultLZ77.first.size() * 8 << " bits" << std::endl;
}

// Example usage
int main() {
    // Example data for compression
    std::string testData = "This is a test string for compression algorithms. "
                          "It contains some repeated patterns to demonstrate compression.";
    
    runCompressionBenchmark(testData);
    
    return 0;
}
