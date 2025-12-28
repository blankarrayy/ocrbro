# n8n-nodes-ocrbro

Extract text from images and PDFs in your n8n workflows. This community node provides OCR (Optical Character Recognition) for images using Tesseract.js and text extraction from PDF documents.

![OCR Bro Node](https://img.shields.io/npm/v/n8n-nodes-ocrbro.svg)

## Features

- **OCR from Images** - Extract text from PNG, JPG, TIFF, BMP, and other image formats using Tesseract.js
- **Extract Text from PDFs** - Pull text content from PDF documents
- **Multi-language Support** - OCR supports 100+ languages via Tesseract language packs
- **No External APIs** - All processing happens locally, no data leaves your server

## Installation

### Via n8n Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter: `n8n-nodes-ocrbro`
5. Click **Install**
6. Restart n8n when prompted

## Video Tutorials

### 1. How to install ocrbro n8n node for free?
[![How to install ocrbro n8n node for free?](https://img.youtube.com/vi/v-SByxejyQ8/0.jpg)](https://youtu.be/v-SByxejyQ8)

### 2. Example PDF Text Extraction
[![Example PDF Text Extraction](https://img.youtube.com/vi/JpXKcSkO61o/0.jpg)](https://youtu.be/JpXKcSkO61o)

### 3. Example Image Text extraction OCR
[![Example Image Text extraction OCR](https://img.youtube.com/vi/sZb9GHWbtbo/0.jpg)](https://youtu.be/sZb9GHWbtbo)

### 4. How to create Private n8n PDF text extraction API endpoint on n8n
[![How to create Private n8n PDF text extraction API endpoint on n8n](https://img.youtube.com/vi/sZb9GHWbtbo/0.jpg)](https://youtu.be/sZb9GHWbtbo)

### 5. How to create Private n8n Image text extraction API endpoint on n8n
[![How to create Private n8n Image text extraction API endpoint on n8n](https://img.youtube.com/vi/crR1N8z0IHw/0.jpg)](https://youtu.be/crR1N8z0IHw)

### Via npm (Self-hosted)

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-ocrbro
# Restart n8n
```

### Docker

Mount the node into your n8n container:

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_CUSTOM_EXTENSIONS="/home/node/.n8n/custom/n8n-nodes-ocrbro" \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

## Usage

### OCR from Image

Extract text from images using Tesseract OCR.

1. Add **OCR Bro** node to your workflow
2. Set **Operation** to `OCR from Image`
3. Configure:
   - **Input Binary Field**: Name of the binary property containing the image (default: `data`)
   - **Language**: Tesseract language code (default: `eng`)

**Example workflow:**
```
[Read Binary File] → [OCR Bro] → [Set Node]
```

**Supported image formats:** PNG, JPG/JPEG, TIFF, BMP, GIF, WebP

**Language codes:**
- `eng` - English
- `deu` - German
- `fra` - French
- `spa` - Spanish
- `chi_sim` - Chinese (Simplified)
- `jpn` - Japanese
- Multiple languages: `eng+deu+fra`

### Extract Text from PDF

Extract text content from PDF documents.

1. Add **OCR Bro** node to your workflow
2. Set **Operation** to `Extract Text from PDF`
3. Configure:
   - **Input Binary Field**: Name of the binary property containing the PDF (default: `data`)

**Example workflow:**
```
[HTTP Request (PDF URL)] → [OCR Bro] → [Code Node]
```

**Output:**
```json
{
  "text": "Extracted text content...",
  "pages": 5
}
```

## Examples

### Basic Image OCR

1. Use **Read Binary File** to load an image
2. Connect to **OCR Bro** with operation `OCR from Image`
3. Output contains `text`, `confidence`, and `words` count

### Batch Process Images

1. Use **Read Binary Files** to load multiple images
2. Connect to **OCR Bro** 
3. Each item will be processed and return extracted text

### Process PDF and Send via Email

1. **HTTP Request** - Download PDF from URL
2. **OCR Bro** - Extract text (operation: `Extract Text from PDF`)
3. **Send Email** - Include extracted text in email body



## Troubleshooting

### Node not appearing after installation
- Restart your n8n instance
- Check the n8n logs for any errors

### Low OCR accuracy
- Use higher resolution images (300 DPI recommended)
- Ensure good contrast between text and background
- Specify the correct language code
- Pre-process images to remove noise if needed

### PDF extraction returns empty text
- The PDF may contain scanned images instead of text
- For scanned PDFs, convert pages to images first, then use the OCR operation

## License

MIT

## Links

- [npm Package](https://www.npmjs.com/package/n8n-nodes-ocrbro)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
