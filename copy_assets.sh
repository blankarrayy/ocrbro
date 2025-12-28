#!/bin/bash
# Copy non-ts files to dist
echo "Copying assets to dist..."
mkdir -p dist/nodes/OcrBro
cp nodes/OcrBro/*.png dist/nodes/OcrBro/ 2>/dev/null || true
echo "Assets copied."
