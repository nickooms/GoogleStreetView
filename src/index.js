import Canvas from 'canvas';
import simplify from 'simplify-js';
import express from 'express';
import fetch from 'node-fetch';
import chalk from 'chalk';

import StreetView from './StreetView';
import { PORT } from './constants';
import BBOX from './BBOX';
import CRAB from './CRAB';
import WMS from './WMS';

const dir = object => {
  console.dir(object, { colors: true, depth: null });
  return object;
};

const getPano = id =>
  StreetView.pano({
    pano: id,
    heading: -45,
    pitch: 10,
    fov: 60,
  });

const image = src => `<img src="${src}">`;

const images = (...sources) => sources.map(image).join('');

const html = (...children) => `
<html>
  <head>
    <style>
      body {
        margin: 0px;
      }
      
      img {
        border: 1px solid #CCC;
        margin: 4px;
      }
    </style>
  </head>
  <body>
    ${children}
  </body>
</html>
`;

const type = typeName => object => object.types.includes(typeName);

const drawPolygon = polygon => {
  const { width, height } = new BBOX(...polygon);
  const canvas = new Canvas(width, height);
  const context = canvas.getContext('2d');
  const moveOrLineTo = ([x, y], index) =>
    context[index === 0 ? 'moveTo' : 'lineTo'](x, y);
  context.beginPath();
  polygon.forEach(moveOrLineTo);
  context.stroke();
  return canvas;
};

const drawCirle = ({ context, radius = 1, color = '#F00' }) => (x, y) => {
  context.fillStyle = color;
  context.lineWidth = 1;
  context.strokeStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fill();
};

const drawPoints = points => {
  const { width, height } = new BBOX(...points);
  const canvas = new Canvas(width, height);
  const drawPoint = drawCirle({ context: canvas.getContext('2d') });
  points.forEach(([x, y]) => drawPoint(x, y));
  return canvas;
};

const getImageData = canvas => {
  const { width, height } = canvas;
  return canvas.getContext('2d').getImageData(0, 0, width, height);
};

const subtract = point => ([x, y]) => [x - point.x, y - point.y];

const multiply = factor => ([x, y]) => [x * factor, y * factor];

const arrayToPoint = ([x, y]) => ({ x, y });

const pointToArray = ({ x, y }) => [x, y];

const app = express();

app.use(express.static('public'));

app.get('/location/:lonLat', async ({ params: { lonLat } }, res) => {
  const [longitude, latitude] = lonLat.split(',').map(parseFloat);
  const reverse = StreetView.reverse({ latitude, longitude });
  const result = await fetch(reverse);
  const json = await result.json();
  const find = (object, propertyName) => object.find(type(propertyName));
  const streetAddress = find(json.results, 'street_address');
  const { address_components: address } = streetAddress;
  const huisnummers = find(address, 'street_number').long_name;
  const Straatnaam = find(address, 'route').long_name;
  const PostkantonCode = find(address, 'postal_code').long_name;
  const Huisnummer = huisnummers.split('-')[0];
  const [{ GemeenteId }] = await CRAB('FindGemeentenByPostkanton', {
    PostkantonCode,
  });
  const [{ StraatnaamId }] = await CRAB('FindStraatnamen', {
    Straatnaam,
    GemeenteId,
  });
  const [{ HuisnummerId }] = await CRAB('FindHuisnummers', {
    Huisnummer,
    StraatnaamId,
  });
  const [{ IdentificatorPerceel }] = await CRAB('ListPercelenByHuisnummerId', {
    HuisnummerId,
  });
  const [{ CenterX, CenterY }] = await CRAB(
    'GetPerceelByIdentificatorPerceel',
    { IdentificatorPerceel },
  );
  const x = parseFloat(CenterX.replace(',', '.'));
  const y = parseFloat(CenterY.replace(',', '.'));
  const featuresUrl = WMS.getFeatureInfo({
    bbox: [x - 1, y - 1, x + 1, y + 1].join(','),
    layers: ['GRB_ADP'],
  });
  const featuresResponse = await fetch(featuresUrl);
  const { features } = await featuresResponse.json();
  const [feature] = features;
  const { coordinates: [outer] } = feature.geometry;
  const bbox = new BBOX(...outer);
  const segments = outer.map(subtract(bbox.min)).map(multiply(10));
  const simplified = simplify(segments.map(arrayToPoint), 1, true).map(
    pointToArray,
  );
  const canvas = drawPolygon(segments);
  const imageData = getImageData(canvas);
  const data = new Uint32Array(imageData.data.buffer);
  const canvasSimplified = drawPolygon(simplified);
  const imageDataSimplified = getImageData(canvasSimplified);
  const dataSimplified = new Uint32Array(imageData.data.buffer);
  data.forEach(
    (x, index) => (data[index] = x === dataSimplified[index] ? 0 : 0xff0000ff),
  );
  // canvas.getContext('2d').putImageData(imageData, 0, 0);
  console.log(
    `${segments.length - 1} points => ${simplified.length - 1} points`,
  );
  res.send(
    html(
      images(
        drawPoints(segments).toDataURL(),
        drawPoints(simplified).toDataURL(),
      ),
    ),
  );
});

app.listen(PORT, () => {
  console.log(chalk.bold.white(`Listening on port ${PORT}.`));
});
