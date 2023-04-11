import fs from 'fs';
import { createCanvas } from 'canvas';

const WIDTH = 28838; 

const HEIGHT = 23276;

const annotations = 
  JSON.parse(fs.readFileSync('./data/3g1xhmd41yfunw.jsonld', 'utf-8'));

const canvas = createCanvas(WIDTH, HEIGHT);

const ctx = canvas.getContext('2d');

console.log(annotations);