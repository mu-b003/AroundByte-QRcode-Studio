# AroundByte QRcode Studio

Static, browser-only QR code & barcode studio in the AroundByte design system (`css/app.css` is reused from AroundByte Card Studio; `css/qr.css` adds QR-specific styles).

Run: `node serve.mjs 8080` → http://localhost:8080 (camera scanning needs HTTPS or localhost).

- `js/qrgen.js` QR types, SVG renderer (square/rounded/dot, logo, ECC) · `js/barcode.js` 9 formats with validation · `js/scan.js` camera + image scanning · `js/bulk.js` CSV/list → ZIP · `js/export.js` PNG/SVG/PDF
- `vendor/` qrcode-generator, JsBarcode, jsQR, ZXing, JSZip, pdf-lib (local, no CDN)
- Logo: `assets/aroundbyte-qrcode-studio-logo.png` — the supplied logo with its baked-in checkerboard keyed out to real transparency (pixels otherwise untouched).
- Scanning UPC-E / Codabar uses the browser's native BarcodeDetector (Chrome/Edge); ZXing fallback does not read those two.
- `tests/` Playwright scripts used during development (they expect a server on :8099).
