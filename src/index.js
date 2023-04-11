import fs from 'fs';
import { createCanvas } from 'canvas';

const WIDTH = 28838; 

const HEIGHT = 23276;

const annotations = 
  JSON.parse(fs.readFileSync('./data/3g1xhmd41yfunw.jsonld', 'utf-8'));

const canvas = createCanvas(WIDTH, HEIGHT);

const ctx = canvas.getContext('2d');

ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

annotations.forEach(annotation => {
  const selector = annotation.target.selector[0];

  if (selector.type === 'SvgSelector') {
    const { value } = selector;

    const [a, b, polygon] = value.match(/(<polygon points=")([^"]*)/) || [];
    if (polygon) {
      const [start, ...points] = polygon.split(' ').map(xy => xy.split(',').map(parseFloat));      
      
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(start[0], start[1]);

      points.forEach(([x, y]) => ctx.lineTo(x, y));

      ctx.closePath();
      ctx.fill();
    }
  } else {

  }
});

console.log('Creating PNG file...');
const stream = canvas.createPNGStream();

const out = fs.createWriteStream('./3g1xhmd41yfunw.png')
stream.pipe(out)

out.on('finish', () => console.log('Done.'));
