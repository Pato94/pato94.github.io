# QR Code Generator

A simple, static QR code generator that runs entirely in your browser. No server required!

## Features

- Generate QR codes from URLs or any text
- Support for URL parameters with base64 encoding
- Download QR codes as PNG images
- Modern, responsive design
- Works offline

## Usage

### Method 1: Manual Input
1. Open `index.html` in your browser
2. Enter any URL or text in the input field
3. Click "Generate QR Code"
4. Download the QR code if needed

### Method 2: URL Parameters
You can pass text directly via URL parameters:

- **Plain text**: `index.html?code=Hello World`
- **Base64 encoded**: `index.html?code=SGVsbG8gV29ybGQ=` (Hello World in base64)
- **URLs**: `index.html?code=https://example.com`

The app will automatically detect if the parameter is base64 encoded and decode it accordingly.

## Examples

- `qr/index.html?code=Hello World`
- `qr/index.html?code=https://github.com`
- `qr/index.html?code=SGVsbG8gV29ybGQ=` (base64 for "Hello World")

## Technical Details

- Uses the [QRCode.js](https://github.com/davidshimjs/qrcodejs) library
- Pure HTML, CSS, and JavaScript
- No external dependencies (except the CDN-hosted QRCode library)
- Responsive design that works on mobile and desktop

## File Structure

```
qr/
├── index.html      # Main HTML file
├── style.css       # Styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- Canvas API
- URLSearchParams API
