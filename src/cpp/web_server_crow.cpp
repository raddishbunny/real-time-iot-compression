
#include <iostream>
#include <string>
#include <random>
#include <chrono>
#include "compression_algorithms.h"
#include "crow.h"  // Crow is a header-only library

// Generate random IoT-like data for simulation
std::string generateIoTData(int size) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(32, 126);  // ASCII printable characters
    
    std::string data;
    data.reserve(size);
    
    for (int i = 0; i < size; ++i) {
        data.push_back(static_cast<char>(dis(gen)));
    }
    
    return data;
}

int main(int argc, char* argv[]) {
    // Parse command line arguments for port
    int port = 8081;
    if (argc > 1) {
        port = std::atoi(argv[1]);
    }
    
    // Create Crow application
    crow::SimpleApp app;
    
    // Configure CORS
    crow::SimpleApp::LogLevel logLevel = crow::LogLevel::INFO;
    app.loglevel(logLevel);
    
    // Define CORS headers middleware
    struct CORSMiddleware {
        struct context {};
        
        void before_handle(crow::request& req, crow::response& res, context& ctx) {
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type");
        }
        
        void after_handle(crow::request& req, crow::response& res, context& ctx) {}
    };
    
    // Add the CORS middleware
    app.use<CORSMiddleware>();
    
    // Define the compression endpoint
    CROW_ROUTE(app, "/api/compress")
    ([](const crow::request& req) {
        // Generate random test data (simulate IoT data)
        std::string testData = generateIoTData(1000);
        
        // Run compression algorithms
        auto resultHuffman = Huffman::compress(testData);
        auto resultRLE = RLE::compress(testData);
        auto resultDelta = Delta::compress(testData);
        auto resultLZ77 = LZ77::compress(testData);
        
        // Create JSON response
        crow::json::wvalue response;
        response["originalSize"] = testData.size();
        
        crow::json::wvalue results;
        
        crow::json::wvalue huffman;
        huffman["algorithm"] = "huffman";
        huffman["compressionRatio"] = resultHuffman.second;
        huffman["compressedSize"] = resultHuffman.first.size();
        
        crow::json::wvalue rle;
        rle["algorithm"] = "rle";
        rle["compressionRatio"] = resultRLE.second;
        rle["compressedSize"] = resultRLE.first.size() * 8;
        
        crow::json::wvalue delta;
        delta["algorithm"] = "delta";
        delta["compressionRatio"] = resultDelta.second;
        delta["compressedSize"] = resultDelta.first.size() * 8;
        
        crow::json::wvalue lz77;
        lz77["algorithm"] = "lz77";
        lz77["compressionRatio"] = resultLZ77.second;
        lz77["compressedSize"] = resultLZ77.first.size() * 8;
        
        results.push_back(std::move(huffman));
        results.push_back(std::move(rle));
        results.push_back(std::move(delta));
        results.push_back(std::move(lz77));
        
        response["results"] = std::move(results);
        
        return response;
    });
    
    // Add an OPTIONS route for CORS preflight requests
    CROW_ROUTE(app, "/api/compress")
    .methods("OPTIONS"_method)
    ([](const crow::request& req) {
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type");
        res.code = 204; // No content
        return res;
    });
    
    // Add a default route
    CROW_ROUTE(app, "/")
    ([]() {
        return "<html><body>"
               "<h1>IoT Data Compression Server</h1>"
               "<p>API Endpoints:</p>"
               "<ul><li>GET /api/compress - Run compression on simulated IoT data</li></ul>"
               "</body></html>";
    });
    
    // Start the server
    std::cout << "Server starting on port " << port << std::endl;
    app.port(port).multithreaded().run();
    
    return 0;
}
