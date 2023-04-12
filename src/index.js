import fs from 'fs';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { polyfillPath2D } from 'path2d-polyfill';
import { polygonArea, svgPathArea } from './utils.js';

global.CanvasRenderingContext2D = CanvasRenderingContext2D;

polyfillPath2D(global);

const COLORS = {
  property: '#ff0000',
  building: '#ffff00',
  label: '#0000ff'
}

const WIDTH = 28838; 

const HEIGHT = 23276;

const canvas = createCanvas(WIDTH, HEIGHT);

const ctx = canvas.getContext('2d');

ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

ctx.fillStyle = '#ff0000';
ctx.strokeStyle = '#000000';
ctx.lineWidth = 4;

// Helper to compute annotation area
const area = annotation => {
  const { value } = annotation.target.selector[0];

  const [a, b, polygon] = value.match(/(<polygon points=")([^"]*)/) || [];
  if (polygon) {
    const points = polygon.split(' ').map(xy => xy.split(',').map(parseFloat));    
    return polygonArea(points);
  }  

  const [c, d, path] = value.match(/(<path d=")([^"]*)/) || [];
  if (path) {
    return svgPathArea(path);
  }
}

// Load annotations from file
const annotations = JSON.parse(fs.readFileSync('./data/3g1xhmd41yfunw.jsonld', 'utf-8'));

// Sort annotations by area, largest first (so that smallest are drawn at the end)
annotations.sort((a, b) => area(b) - area(a));

// Draw annotation shapes to canvas
annotations.forEach(annotation => {
  const selector = annotation.target.selector[0];

  const firstTag = annotation.body.find(b => b.purpose === 'tagging')?.value;
  
  ctx.fillStyle = COLORS[firstTag];

  if (selector.type === 'SvgSelector') {
    const { value } = selector;

    const [a, b, polygon] = value.match(/(<polygon points=")([^"]*)/) || [];
    if (polygon) {
      const [start, ...points] = polygon.split(' ').map(xy => xy.split(',').map(parseFloat));      
      
      ctx.beginPath();
      ctx.moveTo(start[0], start[1]);

      points.forEach(([x, y]) => ctx.lineTo(x, y));

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      const [c, d, path] = value.match(/(<path d=")([^"]*)/) || [];
      ctx.fill(new Path2D(path));
      ctx.stroke(new Path2D(path));
    }
  }
});

// Write result file
console.log('Creating PNG file...');
const stream = canvas.createPNGStream();

const out = fs.createWriteStream('./output/3g1xhmd41yfunw.png')
stream.pipe(out)

out.on('finish', () => console.log('Done.'));
