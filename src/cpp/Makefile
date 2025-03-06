
CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2

all: compression_test

compression_test: compression_algorithms.cpp
	$(CXX) $(CXXFLAGS) -o compression_test compression_algorithms.cpp

clean:
	rm -f compression_test
