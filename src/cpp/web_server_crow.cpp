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
    
    // Define the compression endpoint for auto-generated data
    CROW_ROUTE(app, "/api/compress")
    ([](const crow::request& req) {
        // Generate random test data (simulate IoT data)
        std::string testData = generateIoTData(1000);
        
        // Run compression algorithms
        auto resultHuffman = Huffman::compress(testData);
        auto resultDelta = Delta::compress(testData);
        
        // Create JSON response
        crow::json::wvalue response;
        response["originalSize"] = testData.size();
        
        crow::json::wvalue results;
        
        crow::json::wvalue huffman;
        huffman["algorithm"] = "huffman";
        huffman["compressionRatio"] = resultHuffman.second;
        huffman["compressedSize"] = resultHuffman.first.size();
        
        crow::json::wvalue delta;
        delta["algorithm"] = "delta";
        delta["compressionRatio"] = resultDelta.second;
        delta["compressedSize"] = resultDelta.first.size() * 8;
        
        results.push_back(std::move(huffman));
        results.push_back(std::move(delta));
        
        response["results"] = std::move(results);
        
        return response;
    });
    
    // Define the compression endpoint for user data
    CROW_ROUTE(app, "/api/compress/custom")
    .methods("POST"_method)
    ([](const crow::request& req) {
        auto jsonData = crow::json::load(req.body);
        
        // Check if the JSON parsing was successful and contains the 'data' field
        if (!jsonData || !jsonData.has("data")) {
            crow::json::wvalue error;
            error["error"] = "Invalid request format. Expected JSON with 'data' field.";
            return crow::response(400, error);
        }
        
        // Get the data from the request
        std::string userData = jsonData["data"].s();
        
        if (userData.empty()) {
            crow::json::wvalue error;
            error["error"] = "Data cannot be empty.";
            return crow::response(400, error);
        }
        
        // Run compression algorithms on user data
        auto resultHuffman = Huffman::compress(userData);
        auto resultDelta = Delta::compress(userData);
        
        // Create JSON response
        crow::json::wvalue response;
        response["originalSize"] = userData.size();
        response["originalData"] = userData;
        
        crow::json::wvalue results;
        
        crow::json::wvalue huffman;
        huffman["algorithm"] = "huffman";
        huffman["compressionRatio"] = resultHuffman.second;
        huffman["compressedSize"] = resultHuffman.first.size();
        
        crow::json::wvalue delta;
        delta["algorithm"] = "delta";
        delta["compressionRatio"] = resultDelta.second;
        delta["compressedSize"] = resultDelta.first.size() * 8;
        
        results.push_back(std::move(huffman));
        results.push_back(std::move(delta));
        
        response["results"] = std::move(results);
        
        return response;
    });
    
    // Add an OPTIONS route for CORS preflight requests
    CROW_ROUTE(app, "/api/compress/custom")
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
               "<ul>"
               "<li>GET /api/compress - Run compression on simulated IoT data</li>"
               "<li>POST /api/compress/custom - Run compression on user-provided data</li>"
               "</ul>"
               "</body></html>";
    });
    
    // Start the server
    std::cout << "Server starting on port " << port << std::endl;
    app.port(port).multithreaded().run();
    
    return 0;
}
