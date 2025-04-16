#include <iostream>
#include <string>
#include <cstdlib>
#include <cstring>
#include <vector>
#include <thread>
#include <mutex>
#include <atomic>
#include <condition_variable>
#include <queue>
#include <functional>
#include <chrono>
#include <random>
#include "compression_algorithms.h"
using namespace std;
#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "Ws2_32.lib")
    #define CLOSE_SOCKET closesocket
    typedef SOCKET SocketType;
#else
    #include <unistd.h>
    #include <arpa/inet.h>
    #include <sys/socket.h>
    #include <netinet/in.h>
    #define CLOSE_SOCKET close
    #define SOCKET_ERROR -1
    #define INVALID_SOCKET -1
    typedef int SocketType;
#endif

// Simple Thread Pool
class ThreadPool {
private:
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    std::mutex queue_mutex;
    std::condition_variable condition;
    std::atomic<bool> stop;

public:
    ThreadPool(size_t numThreads) : stop(false) {
        for (size_t i = 0; i < numThreads; ++i) {
            workers.emplace_back([this] {
                while (true) {
                    std::function<void()> task;
                    {
                        std::unique_lock<std::mutex> lock(this->queue_mutex);
                        this->condition.wait(lock, [this] { 
                            return this->stop || !this->tasks.empty(); 
                        });
                        
                        if (this->stop && this->tasks.empty()) {
                            return;
                        }
                        
                        task = std::move(this->tasks.front());
                        this->tasks.pop();
                    }
                    task();
                }
            });
        }
    }

    ~ThreadPool() {
        {
            std::unique_lock<std::mutex> lock(queue_mutex);
            stop = true;
        }
        condition.notify_all();
        for (std::thread &worker : workers) {
            worker.join();
        }
    }

    template<class F>
    void enqueue(F&& f) {
        {
            std::unique_lock<std::mutex> lock(queue_mutex);
            tasks.emplace(std::forward<F>(f));
        }
        condition.notify_one();
    }
};

// Simple HTTP Server
class HttpServer {
private:
    SocketType serverSocket;
    int port;
    std::atomic<bool> running;
    ThreadPool threadPool;
    
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
    
    // Parse JSON request body
    std::string parseJsonValue(const std::string& json, const std::string& key) {
        std::string keyStr = "\"" + key + "\"";
        size_t pos = json.find(keyStr);
        if (pos == std::string::npos) return "";
        
        pos = json.find(":", pos);
        if (pos == std::string::npos) return "";
        
        pos = json.find("\"", pos);
        if (pos == std::string::npos) return "";
        
        size_t start = pos + 1;
        size_t end = json.find("\"", start);
        if (end == std::string::npos) return "";
        
        return json.substr(start, end - start);
    }
    
    void handleClient(SocketType clientSocket) {
        const int bufferSize = 4096;
        char buffer[bufferSize];
        
        // Receive HTTP request
        int bytesRead = recv(clientSocket, buffer, bufferSize - 1, 0);
        if (bytesRead <= 0) {
            CLOSE_SOCKET(clientSocket);
            return;
        }
        
        buffer[bytesRead] = '\0';
        std::string request(buffer);
        
        // Parse HTTP request
        std::string response;
        
        if (request.find("GET /api/compress") != std::string::npos) {
            // Generate random test data (simulate IoT data)
            std::string testData = generateIoTData(1000);
            
            // Run compression algorithms
            auto resultHuffman = Huffman::compress(testData);
            auto resultRLE = RLE::compress(testData);
            auto resultDelta = Delta::compress(testData);
            auto resultLZ77 = LZ77::compress(testData);
            
            // Create JSON response
            response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: application/json\r\n";
            response += "Access-Control-Allow-Origin: *\r\n";
            response += "Connection: close\r\n\r\n";
            
            response += "{\n";
            response += "  \"originalSize\": " + std::to_string(testData.size()) + ",\n";
            response += "  \"results\": [\n";
            response += "    {\n";
            response += "      \"algorithm\": \"huffman\",\n";
            response += "      \"compressionRatio\": " + std::to_string(resultHuffman.second) + ",\n";
            response += "      \"compressedSize\": " + std::to_string(resultHuffman.first.size()) + "\n";
            response += "    },\n";
            response += "    {\n";
            response += "      \"algorithm\": \"rle\",\n";
            response += "      \"compressionRatio\": " + std::to_string(resultRLE.second) + ",\n";
            response += "      \"compressedSize\": " + std::to_string(resultRLE.first.size() * 8) + "\n";
            response += "    },\n";
            response += "    {\n";
            response += "      \"algorithm\": \"delta\",\n";
            response += "      \"compressionRatio\": " + std::to_string(resultDelta.second) + ",\n";
            response += "      \"compressedSize\": " + std::to_string(resultDelta.first.size() * 8) + "\n";
            response += "    },\n";
            response += "    {\n";
            response += "      \"algorithm\": \"lz77\",\n";
            response += "      \"compressionRatio\": " + std::to_string(resultLZ77.second) + ",\n";
            response += "      \"compressedSize\": " + std::to_string(resultLZ77.first.size() * 8) + "\n";
            response += "    }\n";
            response += "  ]\n";
            response += "}\n";
        } 
        else if (request.find("POST /api/compress/custom") != std::string::npos) {
            // Find the content length
            std::string contentLengthStr = "Content-Length: ";
            size_t contentLengthPos = request.find(contentLengthStr);
            if (contentLengthPos == std::string::npos) {
                response = "HTTP/1.1 400 Bad Request\r\n";
                response += "Content-Type: application/json\r\n";
                response += "Access-Control-Allow-Origin: *\r\n";
                response += "Connection: close\r\n\r\n";
                response += "{\"error\": \"Content-Length not found\"}";
                send(clientSocket, response.c_str(), response.size(), 0);
                CLOSE_SOCKET(clientSocket);
                return;
            }
            
            size_t contentLengthStart = contentLengthPos + contentLengthStr.length();
            size_t contentLengthEnd = request.find("\r\n", contentLengthStart);
            std::string contentLengthValue = request.substr(contentLengthStart, contentLengthEnd - contentLengthStart);
            int contentLength = std::stoi(contentLengthValue);
            
            // Find the start of the body
            size_t bodyStart = request.find("\r\n\r\n");
            if (bodyStart == std::string::npos) {
                response = "HTTP/1.1 400 Bad Request\r\n";
                response += "Content-Type: application/json\r\n";
                response += "Access-Control-Allow-Origin: *\r\n";
                response += "Connection: close\r\n\r\n";
                response += "{\"error\": \"Request body not found\"}";
                send(clientSocket, response.c_str(), response.size(), 0);
                CLOSE_SOCKET(clientSocket);
                return;
            }
            
            bodyStart += 4; // Skip the \r\n\r\n
            std::string body = request.substr(bodyStart);
            
            // If we haven't received the full body yet, read more
            if (body.length() < contentLength) {
                int remainingLength = contentLength - body.length();
                char* additionalBuffer = new char[remainingLength + 1];
                
                int additionalBytesRead = recv(clientSocket, additionalBuffer, remainingLength, 0);
                if (additionalBytesRead > 0) {
                    additionalBuffer[additionalBytesRead] = '\0';
                    body += additionalBuffer;
                }
                
                delete[] additionalBuffer;
            }
            
            // Try to parse the JSON body to get the data
            std::string userData = "";
            size_t dataPos = body.find("\"data\"");
            if (dataPos != std::string::npos) {
                size_t colonPos = body.find(":", dataPos);
                if (colonPos != std::string::npos) {
                    size_t valueStart = body.find("\"", colonPos);
                    if (valueStart != std::string::npos) {
                        valueStart++; // Skip the opening quote
                        size_t valueEnd = body.find("\"", valueStart);
                        if (valueEnd != std::string::npos) {
                            userData = body.substr(valueStart, valueEnd - valueStart);
                        }
                    }
                }
            }
            
            if (userData.empty()) {
                response = "HTTP/1.1 400 Bad Request\r\n";
                response += "Content-Type: application/json\r\n";
                response += "Access-Control-Allow-Origin: *\r\n";
                response += "Connection: close\r\n\r\n";
                response += "{\"error\": \"Invalid request format or missing 'data' field\"}";
                send(clientSocket, response.c_str(), response.size(), 0);
                CLOSE_SOCKET(clientSocket);
                return;
            }
            
            // Run compression algorithms on the user data
            auto resultHuffman = Huffman::compress(userData);
            auto resultRLE = RLE::compress(userData);
            auto resultDelta = Delta::compress(userData);
            auto resultLZ77 = LZ77::compress(userData);
            
            // Create JSON response
            response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: application/json\r\n";
            response += "Access-Control-Allow-Origin: *\r\n";
            response += "Connection: close\r\n\r\n";
            
            response += "{\n";
            response += "  \"originalSize\": " + std::to_string(userData.size()) + ",\n";
            response += "  \"originalData\": \"" + userData + "\",\n";
            response += "  \"results\": [\n";
            response += "    {\n";
            response += "      \"algorithm\": \"huffman\",\n";
            response += "      \"compressionRatio\": " + std::to_string(resultHuffman.second) + ",\n";
            response += "      \"compressedSize\": " + std::to_string(resultHuffman.first.size()) + "\n";
            response += "    },\n";
            response += "    {\n";
            response += "      \"algorithm\": \"rle\",\n";
            response += "      \"compressionRatio\": " + std::to_string(resultRLE.second) + ",\n";
            response += "      \"compressedSize\": " + std::to_string(resultRLE.first.size() * 8) + "\n";
            response += "    },\n";
            response += "    {\n";
            response += "      \"algorithm\": \"delta\",\n";
            response += "      \"compressionRatio\": " + std::to_string(resultDelta.second) + ",\n";
            response += "      \"compressedSize\": " + std::to_string(resultDelta.first.size() * 8) + "\n";
            response += "    },\n";
            response += "    {\n";
            response += "      \"algorithm\": \"lz77\",\n";
            response += "      \"compressionRatio\": " + std::to_string(resultLZ77.second) + ",\n";
            response += "      \"compressedSize\": " + std::to_string(resultLZ77.first.size() * 8) + "\n";
            response += "    }\n";
            response += "  ]\n";
            response += "}\n";
        }
        else if (request.find("OPTIONS") != std::string::npos) {
            // Handle CORS preflight requests
            response = "HTTP/1.1 204 No Content\r\n";
            response += "Access-Control-Allow-Origin: *\r\n";
            response += "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
            response += "Access-Control-Allow-Headers: Content-Type\r\n";
            response += "Connection: close\r\n\r\n";
        }
        else {
            // Default response
            response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: text/html\r\n";
            response += "Connection: close\r\n\r\n";
            response += "<html><body>";
            response += "<h1>IoT Data Compression Server</h1>";
            response += "<p>API Endpoints:</p>";
            response += "<ul>";
            response += "<li>GET /api/compress - Run compression on simulated IoT data</li>";
            response += "<li>POST /api/compress/custom - Run compression on user-provided data</li>";
            response += "</ul>";
            response += "</body></html>";
        }
        
        // Send response
        send(clientSocket, response.c_str(), response.size(), 0);
        CLOSE_SOCKET(clientSocket);
    }

public:
    HttpServer(int port) : port(port), running(false), threadPool(4) {
#ifdef _WIN32
        WSADATA wsaData;
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
            std::cerr << "WSAStartup failed" << std::endl;
            exit(1);
        }
#endif
        
        serverSocket = socket(AF_INET, SOCK_STREAM, 0);
        if (serverSocket == INVALID_SOCKET) {
            std::cerr << "Failed to create socket" << std::endl;
#ifdef _WIN32
            WSACleanup();
#endif
            exit(1);
        }
        
        // Allow reuse of address
        int opt = 1;
        setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));
        
        struct sockaddr_in serverAddr;
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_port = htons(port);
        serverAddr.sin_addr.s_addr = INADDR_ANY;
        
        if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
            std::cerr << "Bind failed" << std::endl;
            CLOSE_SOCKET(serverSocket);
#ifdef _WIN32
            WSACleanup();
#endif
            exit(1);
        }
        
        if (listen(serverSocket, 10) == SOCKET_ERROR) {
            std::cerr << "Listen failed" << std::endl;
            CLOSE_SOCKET(serverSocket);
#ifdef _WIN32
            WSACleanup();
#endif
            exit(1);
        }
    }
    
    ~HttpServer() {
        stop();
    }
    
    void start() {
        running = true;
        std::cout << "Server started on port " << port << std::endl;
        
        while (running) {
            struct sockaddr_in clientAddr;
#ifdef _WIN32
            int addrLen = sizeof(clientAddr);
#else
            socklen_t addrLen = sizeof(clientAddr);
#endif
            SocketType clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &addrLen);
            
            if (clientSocket == INVALID_SOCKET) {
                if (!running) break;
                std::cerr << "Accept failed" << std::endl;
                continue;
            }
            
            threadPool.enqueue([this, clientSocket]() {
                this->handleClient(clientSocket);
            });
        }
    }
    
    void stop() {
        running = false;
        CLOSE_SOCKET(serverSocket);
#ifdef _WIN32
        WSACleanup();
#endif
    }
};

int main(int argc, char* argv[]) {
    int port = 8081;
    if (argc > 1) {
        port = std::atoi(argv[1]);
    }
    
    HttpServer server(port);
    server.start();
    
    return 0;
}
