import { Alchemy, Network } from 'alchemy-sdk';
import { createCanvas, registerFont } from 'canvas';
import Jimp from 'jimp';

import * as fs from 'fs';
import sharp from 'sharp';
import asciify from './asciify.js';
import puppeteer from 'puppeteer';
import "json";
const MILADY = "0x5Af0D9827E0c53E4799BB226655A1de152A425a5";

// Optional config object, but defaults to the API key 'demo' and Network 'eth-mainnet'.
const settings = {
    apiKey: "tgog4mjU6OYchrKHLMXl3-sKk1VanlND", // Replace with your Alchemy API key.
    network: Network.ETH_MAINNET // Replace with your network.
  };
  
const alchemy = new Alchemy(settings);

const nftMetadata = await alchemy.nft.getNftMetadata(
    MILADY, "1"
);

const rawMetadata = nftMetadata.rawMetadata;

const image = rawMetadata.image;
var options = {
    fit:    'none',
    width:  200,
    height: 250,
    color: true
  }

// Launch a headless browser instance
const browser = await puppeteer.launch();

// Open a new page
const page = await browser.newPage();

// Set the viewport size to match the desired output size of the image
await page.setViewport({ width: 1000, height: 1250 });
const [asciified, colors] = await asciify(image, options);
//console.log(asciified);
page
.on('console', message =>
  console.log(`${message.type().toUpperCase()} ${message.text()}`));
// Navigate to a blank page
console.log(colors[1]);
await page.goto('about:blank');
await page.evaluate((asciiArt, colorMap) => {

        // Define the size of the canvas
        const canvasWidth = 1000;
        const canvasHeight = 1250;

        // Create a new canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        console.log(colorMap[1]);

        document.body.appendChild(canvas);
        // Draw the text onto the canvas
        ctx.font = '5px monospace';

        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const textWidth = ctx.measureText(asciiArt).width;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = asciiArt.split('\n');

        const lineHeight = 5; // Set the line height to match the font size
        const startY = centerY - (lines.length / 2) * lineHeight;
        lines.forEach((line, index) => {
            console.log(line);
            const y = startY + index * lineHeight;
            let x = centerX - ctx.measureText(line).width / 2;
            while (line) {
              const colorMatch = line.match(/^(\d+)/);
              if (colorMatch) {
                const c = colorMatch[0];
                if (colorMap[c]) {
                    const rgbColor = [colorMap[c].r, colorMap[c].g, colorMap[c].b];
                    ctx.fillStyle = `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`;
                } else {
                    ctx.fillStyle = `black`;
                }
                line = line.substring(colorMatch.length);
              } else {
                const char = line[0];
                ctx.fillText(char, x, y);
                x += ctx.measureText(char).width;
                line = line.substring(1);
              }
            }
          });
}, asciified, colors);

// Take a screenshot of the canvas and save it as a PNG image
await page.screenshot({ path: 'output/img/1.png', type: 'png', clip: { x: 5, y: 5, width: 1000, height: 1250 } });

// Close the browser instance
await browser.close();

fs.writeFile('output/json/1.json', JSON.stringify(rawMetadata), err => {
    if (err) {
        console.error(err);
    }
});

//const response = await fetch(image);
//const buffer = await response.arrayBuffer();
//sharp(new Uint8Array(buffer)).toFile('output/start_milady/1.png');
console.log(rawMetadata);
