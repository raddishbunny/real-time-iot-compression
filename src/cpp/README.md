
# IoT Data Compression C++ Implementation

This directory contains the C++ implementation of various compression algorithms for IoT data:

- Huffman Coding
- Run-Length Encoding (RLE)
- Delta Encoding
- LZ77 Compression

## Dependencies

- Crow - A C++ microframework for web (https://github.com/CrowCpp/Crow)

### Installing Crow

Crow is a header-only library, so you can just download the single header file:

```bash
wget https://github.com/CrowCpp/Crow/releases/latest/download/crow_all.h -O crow.h
```

Or using curl:

```bash
curl -L https://github.com/CrowCpp/Crow/releases/latest/download/crow_all.h -o crow.h
```

Place the downloaded `crow.h` file in the `src/cpp` directory before building.

## Building and Running

### Standalone Test

To build and run the standalone compression test:

```bash
make -f Makefile
./compression_test
```

### Web Server

To build and run the web server that exposes the compression algorithms via a REST API:

```bash
# First, make sure you have crow.h in the directory
wget https://github.com/CrowCpp/Crow/releases/latest/download/crow_all.h -O crow.h

# Then build and run
make -f Makefile.web
./web_server [port]
```

By default, the server runs on port 8081.

## API Endpoints

- `GET /api/compress`: Run compression algorithms on simulated IoT data and return results.

## Integrating with the React Frontend

The React frontend can fetch data from the C++ backend by making HTTP requests to the API endpoints.
For example:

```javascript
fetch('http://localhost:8081/api/compress')
  .then(response => response.json())
  .then(data => {
    // Update the UI with the compression results
    console.log(data);
  });
```

## Performance Notes

The current implementation prioritizes clarity over maximum performance. 
For production use, consider:

1. Using binary formats for data transfer
2. Implementing more efficient versions of the algorithms
3. Adding decompression functionality
4. Adding persistent storage for compression results
