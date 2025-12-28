#!/bin/bash

# Define paths
PROJECT_NAME="n8n-nodes-ocrbro"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER_CUSTOM_DIR="$SOURCE_DIR/docker-custom"

echo "🚀 Starting deployment of $PROJECT_NAME for Docker..."

# 1. Build the project locally first to ensure it's fresh
echo "🛠️  Building project..."
cd "$SOURCE_DIR"
if ! npm run build; then
    echo "❌ Build failed! Aborting."
    exit 1
fi

# Copy assets after build
if [ -f "./copy_assets.sh" ]; then
    ./copy_assets.sh
fi

# 2. Create a clean distribution folder for Docker mounting
echo "📁 Preparing Docker custom extensions folder..."
rm -rf "$DOCKER_CUSTOM_DIR"
mkdir -p "$DOCKER_CUSTOM_DIR/$PROJECT_NAME"

# 3. Copy necessary files - the complete npm package structure
echo "📦 Copying files..."
cp -r dist "$DOCKER_CUSTOM_DIR/$PROJECT_NAME/"
cp package.json "$DOCKER_CUSTOM_DIR/$PROJECT_NAME/"
cp package-lock.json "$DOCKER_CUSTOM_DIR/$PROJECT_NAME/" 2>/dev/null || true
cp eng.traineddata "$DOCKER_CUSTOM_DIR/$PROJECT_NAME/" 2>/dev/null || true

# 4. Install production dependencies inside the package
echo "📥 Installing dependencies..."
cd "$DOCKER_CUSTOM_DIR/$PROJECT_NAME"
npm install --omit=dev --ignore-scripts

echo ""
echo "---------------------------------------------------"
echo "✅ Build Complete!"
echo "📍 Custom extensions folder: $DOCKER_CUSTOM_DIR"
echo ""
echo "🐳 To run n8n with this custom node, use:"
echo ""
echo "docker run -it --rm \\"
echo "  --name n8n \\"
echo "  -p 5678:5678 \\"
echo "  -e N8N_CUSTOM_EXTENSIONS=\"/home/node/.n8n/custom/$PROJECT_NAME\" \\"
echo "  -v n8n_data:/home/node/.n8n \\"
echo "  -v $DOCKER_CUSTOM_DIR:/home/node/.n8n/custom \\"
echo "  docker.n8n.io/n8nio/n8n"
echo ""
echo "Or use the provided docker-compose.yml:"
echo "  docker-compose up"
echo ""
echo "---------------------------------------------------"
