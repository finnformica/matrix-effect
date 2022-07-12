const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1920, 1080 ],
  animate: true
};

let manager, img;

const url = "input/luna-eating.jpg";

// font style
const fontSize = 25;
const fontFamily = 'matrix-font';

// load falling characters
const string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890123456789$$";
const chars = string.split("");

// define secondary canvas + context
const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

// begin sketch function
const sketch = ({ context, width, height }) => {



  loadCustomFont()

  // define columns and rows
  const cell = 20;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = cols * rows;


  typeCanvas.width = cols;
  typeCanvas.height = rows;

  // make background black
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height)

  // draw image on background
  typeContext.save();
  typeContext.drawImage(img, 0, 0, cols, rows);
  typeContext.restore();

  // extract RGB pixel data
  const typeData = typeContext.getImageData(0, 0, cols, rows).data;

  const imgTop = typeData.findIndex(x => x != 255) / 4;
  const imgHeight = height;

  // generate an array of column indexes
  const ypos = Array(cols).fill(-cell);

  return ({ context, width, height }) => {

    // horizontal + vertical char centre
    context.textBaseline = 'middle';
    context.textAlign = 'center';

    // --- MATRIX SCREEN ---

    // draw semitransparent black rect over previous frame
    context.fillStyle = 'rgba(0, 0, 0, 0.001)';
    context.fillRect(0, 0, width + cell, height + cell);

    // set char font style
    context.fillStyle = '#0f0';
    context.font = `${fontSize}px ${fontFamily}`;

    // for each column put a random character at the end
    ypos.forEach((y, ind) => {
      // generate a random character
      const rand = chars[Math.floor(Math.random() * chars.length)];

      // x coordinate of the column, y coordinate is already given
      const x = ind * cell;
      context.fillText(rand, x, y);

      // reset column if char reaches bottom or randomly
      if (y > Math.random() * 1000000 * 0.1 || y > height) { ypos[ind] = -cell;}

      // otherwise just move the y coordinate down
      else ypos[ind] = y + cell;

    });

    // draw opacity based on image rgb value
    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4 + 0];
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];


      context.fillStyle = `rgba(0, 0, 0, ${(255 - g)/255/25})`;

      context.save();
      context.translate(x, y);
      context.fillRect(0, 0, cell, cell);
      context.restore();
    }
  };
};


const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject;
    img.src = url;
    settings.dimensions = [ img.width * 2, img.height * 2 ];
  });
};


const start = async () => {
  img = await loadImage(url);
  manager = canvasSketch(sketch, settings);
}

function loadCustomFont() {
  const style = document.getElementsByTagName('style')[3];
  if (style.innerHTML.includes("font-face") != true) {
    style.innerHTML += "\@font-face {\n   font-family: 'matrix-font';\n   src: url('matrix-font.ttf') format('truetype');\n   }"
  }
}


start();
