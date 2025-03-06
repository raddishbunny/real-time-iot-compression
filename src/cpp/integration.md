
# Integrating the C++ Compression Backend with the React Frontend

This document explains how to integrate the C++ compression backend with the React frontend.

## Building and Running the C++ Backend

1. Navigate to the `src/cpp` directory:

```bash
cd src/cpp
```

2. Build the web server:

```bash
make -f Makefile.web
```

3. Run the web server:

```bash
./web_server 8081
```

The server will start on port 8081 by default.

## Connecting from the React Frontend

1. In the React application, use the "Connect C++" button in the Simulation Control panel to connect to the C++ backend.

2. If the C++ server is running on a different port or machine, update the URL in the input field.

3. When connected, the application will use real compression results from the C++ algorithms instead of simulated data.

## API Integration Details

The C++ backend provides a RESTful API that returns compression results in JSON format:

```json
{
  "originalSize": 1000,
  "results": [
    {
      "algorithm": "huffman",
      "compressionRatio": 0.45,
      "compressedSize": 550
    },
    {
      "algorithm": "rle",
      "compressionRatio": 0.30,
      "compressedSize": 700
    },
    {
      "algorithm": "delta",
      "compressionRatio": 0.25,
      "compressedSize": 750
    },
    {
      "algorithm": "lz77",
      "compressionRatio": 0.42,
      "compressedSize": 580
    }
  ]
}
```

The React frontend uses this data to update the compression statistics and charts.

## Troubleshooting

If you cannot connect to the C++ backend:

1. Ensure the C++ server is running.
2. Check the port number in the URL.
3. If running on a different machine, ensure network access is allowed.
4. Check browser console for CORS errors. The C++ server includes CORS headers, but additional configuration may be needed.
