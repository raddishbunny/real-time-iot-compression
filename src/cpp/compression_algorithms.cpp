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

// Main function to run compression benchmarks
void runCompressionBenchmark(const std::string& inputData) {
    // Run algorithms and compare
    auto resultHuffman = Huffman::compress(inputData);
    auto resultDelta = Delta::compress(inputData);
    
    // Output results
    std::cout << "Input size: " << inputData.size() << " bytes" << std::endl;
    std::cout << "Huffman: " << (resultHuffman.second * 100) << "% reduction" << std::endl;
    std::cout << "Delta: " << (resultDelta.second * 100) << "% reduction" << std::endl;
    
    // Output compressed sizes
    std::cout << "Huffman compressed size: " << resultHuffman.first.size() << " bits" << std::endl;
    std::cout << "Delta compressed size: " << resultDelta.first.size() * 8 << " bits" << std::endl;
}

// Example usage
int main() {
    std::string testData = "This is a test string for compression algorithms. "
                          "It contains some repeated patterns to demonstrate compression.";
    
    runCompressionBenchmark(testData);
    
    return 0;
}
