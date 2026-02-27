// Generates icon-192.png and icon-512.png for the FocusGrid PWA.
// Uses only built-in Node.js APIs + the Canvas API via a tiny inline SVG encoded as PNG.
// Since we don't have sharp/canvas installed, we use a pure-Buffer approach to write
// minimal valid PNG files that embed an SVG-derived pixel art icon.

const fs = require('fs');
const path = require('path');

// We'll create a minimal valid PNG from scratch using zlib + raw pixel data.
const zlib = require('zlib');

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = (() => {
        const t = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
            t[i] = c;
        }
        return t;
    })();
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function uint32BE(n) {
    const b = Buffer.alloc(4);
    b.writeUInt32BE(n, 0);
    return b;
}

function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = uint32BE(data.length);
    const crcData = Buffer.concat([typeBytes, data]);
    return Buffer.concat([len, typeBytes, data, uint32BE(crc32(crcData))]);
}

function generateFocusGridIcon(size) {
    const w = size, h = size;
    // RGBA pixel array
    const pixels = new Uint8Array(w * h * 4);

    const bg = [9, 9, 11, 255];         // #09090b - dark charcoal
    const accent = [16, 185, 129, 255]; // #10b981 - emerald green
    const gridLine = [25, 25, 30, 255]; // subtle grid line color

    // Fill background
    for (let i = 0; i < w * h; i++) {
        pixels[i * 4 + 0] = bg[0];
        pixels[i * 4 + 1] = bg[1];
        pixels[i * 4 + 2] = bg[2];
        pixels[i * 4 + 3] = bg[3];
    }

    // Draw subtle grid lines (every size/8 pixels)
    const gridSpacing = Math.floor(size / 8);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (x % gridSpacing === 0 || y % gridSpacing === 0) {
                const idx = (y * w + x) * 4;
                pixels[idx] = gridLine[0];
                pixels[idx + 1] = gridLine[1];
                pixels[idx + 2] = gridLine[2];
                pixels[idx + 3] = gridLine[3];
            }
        }
    }

    // Draw "F" shape in the center using relative coordinates
    // "F" occupies roughly 30-70% of the icon
    const margin = Math.floor(size * 0.28);
    const thickness = Math.max(2, Math.floor(size * 0.1));

    // Vertical stroke of F
    for (let y = margin; y < h - margin; y++) {
        for (let x = margin; x < margin + thickness; x++) {
            const idx = (y * w + x) * 4;
            pixels[idx] = accent[0]; pixels[idx + 1] = accent[1];
            pixels[idx + 2] = accent[2]; pixels[idx + 3] = accent[3];
        }
    }
    // Top horizontal of F
    for (let y = margin; y < margin + thickness; y++) {
        for (let x = margin; x < w - margin; x++) {
            const idx = (y * w + x) * 4;
            pixels[idx] = accent[0]; pixels[idx + 1] = accent[1];
            pixels[idx + 2] = accent[2]; pixels[idx + 3] = accent[3];
        }
    }
    // Middle horizontal of F (at ~45% height)
    const midY = Math.floor(h * 0.45);
    for (let y = midY; y < midY + thickness; y++) {
        for (let x = margin; x < Math.floor(w * 0.72); x++) {
            const idx = (y * w + x) * 4;
            pixels[idx] = accent[0]; pixels[idx + 1] = accent[1];
            pixels[idx + 2] = accent[2]; pixels[idx + 3] = accent[3];
        }
    }

    // Build PNG
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = chunk('IHDR', Buffer.concat([uint32BE(w), uint32BE(h), Buffer.from([8, 2, 0, 0, 0])]));

    // Build raw image data (filter byte=0 per scanline)
    const rawRows = [];
    for (let y = 0; y < h; y++) {
        rawRows.push(Buffer.from([0])); // filter type none
        rawRows.push(Buffer.from(pixels.slice(y * w * 4, (y + 1) * w * 4)));
    }
    const rawData = Buffer.concat(rawRows);
    const compressed = zlib.deflateSync(rawData, { level: 9 });
    const idat = chunk('IDAT', compressed);
    const iend = chunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdr, idat, iend]);
}

const publicDir = path.join(__dirname, 'public');
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), generateFocusGridIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), generateFocusGridIcon(512));
console.log('Icons generated: icon-192.png, icon-512.png');
