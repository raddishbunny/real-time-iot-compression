
#ifndef COMPRESSION_ALGORITHMS_H
#define COMPRESSION_ALGORITHMS_H

#include <string>
#include <utility>

namespace Huffman {
    std::pair<std::string, double> compress(const std::string& data);
}

namespace Delta {
    std::pair<std::string, double> compress(const std::string& data);
}

void runCompressionBenchmark(const std::string& inputData);

#endif // COMPRESSION_ALGORITHMS_H
