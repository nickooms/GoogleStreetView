import Canvas from 'canvas';
import simplify from 'simplify-js';
import express from 'express';
import fetch from 'node-fetch';
import chalk from 'chalk';
import NP from 'number-precision';

import StreetView from './StreetView';
import GeoLocation from './GeoLocation';
import { PORT } from './constants';
import BBOX from './BBOX';
import CRAB from './CRAB';
import City from './City';
import Street from './Street';
import Housenumber from './Housenumber';
import Plot from './Plot';
import Buildings from './Buildings';
import Building from './Building';
import WMS from './WMS';
import { flatten } from './util';

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
        margin: 0px;
        width: 49%;
      }
    </style>
  </head>
  <body>
    ${children}
  </body>
</html>
`;

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
  const context = canvas.getContext('2d');
  const drawPoint = drawCirle({ context, radius: 5 });
  points.forEach(([x, y]) => drawPoint(x, y));
  return canvas;
};

const draw = polygon => {
  const { width, height } = new BBOX(...polygon);
  const canvas = new Canvas(width, height);
  const context = canvas.getContext('2d');
  const drawPoint = drawCirle({ context, radius: 5 });
  const moveOrLineTo = ([x, y], index) =>
    context[index === 0 ? 'moveTo' : 'lineTo'](x, y);
  context.beginPath();
  polygon.forEach(moveOrLineTo);
  context.stroke();
  polygon.forEach(([x, y]) => drawPoint(x, y));
  return canvas;
};

const getImageData = canvas => {
  const { width, height } = canvas;
  return canvas.getContext('2d').getImageData(0, 0, width, height);
};

const add = point => ([x, y]) => [x + point.x, y + point.y];

const subtract = point => ([x, y]) => [x - point.x, y - point.y];

const multiply = factor => ([x, y]) => [x * factor, y * factor];

const arrayToPoint = ([x, y]) => ({ x, y });

const pointToArray = ({ x, y }) => [x, y];

const roundPoint = ([x, y]) => [NP.round(x, 3), NP.round(y, 3)];

const simplifyPolygon = polygon => {
  const bbox = new BBOX(...polygon);
  const segments = polygon.map(subtract(bbox.min)).map(multiply(10));
  const simplified = simplify(segments.map(arrayToPoint), 1, true)
    .map(pointToArray)
    .map(roundPoint);
  const canvas = drawPolygon(segments);
  const imageData = getImageData(canvas);
  const data = new Uint32Array(imageData.data.buffer);
  const canvasSimplified = drawPolygon(simplified);
  const imageDataSimplified = getImageData(canvasSimplified);
  const dataSimplified = new Uint32Array(imageData.data.buffer);
  data.forEach(
    (x, index) => (data[index] = x === dataSimplified[index] ? 0 : 0xff0000ff),
  );
  /* console.log(
    `${segments.length - 1} points => ${simplified.length - 1} points`,
  );*/
  return {
    bbox,
    segments: segments.map(multiply(1 / 10)).map(add(bbox.min)),
    simplified: simplified.map(multiply(1 / 10)).map(add(bbox.min)),
  };
};

const app = express();

app.use(express.static('public'));

app.get('/location/:lonLat', async ({ params: { lonLat } }, res) => {
  const time = new Date().getTime();
  const [longitude, latitude] = lonLat.split(',').map(parseFloat);
  const reverse = await GeoLocation.reverse({ latitude, longitude });
  // const number = reverse.housenumbers[0];
  const [city] = await City.find(reverse.zip);
  const street = await city.street(reverse.street);
  // const [street] = await Street.byName(reverse.street, city.id);
  const imageList = [];
  // const housenumbers = await street.housenumbers();
  // const housenumberIds = housenumbers.map(({ id }) => id)
  // dir(housenumbers.length);
  const buildings = await street.buildings();
  // dir(buildings.length);
  const simplified = flatten(
    buildings.map(building => {
      const { bbox, segments, simplified } = simplifyPolygon(building.geometry);
      // imageList.push(draw(segments).toDataURL());
      // imageList.push(draw(simplified).toDataURL());
      return { bbox, segments, simplified };
    }),
  );

  // dir({ simplified });
  // const points = flatten(simplified.map(({ simplified }) => simplified));
  const points = flatten(buildings.map(x => x.geometry));
  // dir({ points });
  const bbox = new BBOX(...points);
  dir({ bbox });

  const svg = ({ width, height, viewBox, children }) => `
<svg viewBox="${viewBox}">
  <style>
    polygon {
      stroke: black;
      stroke-width: 0.1;
      fill: none;
    }

    text {
      font-size: 3px;
    }
  </style>
  ${children.join('\n')}
</svg>
  `;
  const { min, width, height } = bbox;
  res.send(svg({
    width,
    height,
    viewBox: `${min.x} ${min.y} ${width} ${height}`,
    children: simplified.map((building, index) => {
      const points = building.simplified
        .map(point => point.join(',')).join(' ');
      const x = building.bbox.center.x;
      const y = building.bbox.center.y;
      const text = buildings[index].number;
      return ` <polygon points="${points}" />
  <text x="${x}" y="${y}">${text}</text>`;
    }),
  }));
  // const bbox = new BBOX(...flatten(buildings.map(x => x.geometry)));
  // dir(bbox);
  /* const a = await Promise.all(
    housenumbers.map(x => x.number).map(async number => {
      console.log('number:', number);
      const [housenumber] = await Housenumber.byNumber(number, street.id);
      console.log('housenumber:', housenumber);
      const [plot] = await Plot.byHousenumberId(housenumber.id);
      console.log('plot:', plot);
      const buildingIds = await Buildings.byHousenumberId(housenumber.id);
      console.log('buildingIds:', buildingIds);
      const [[building]] = await Promise.all(
        buildingIds.map(async ({ id }) => await Building.byId(id)),
      );
      const [{ center: { x, y } }] = await Plot.byId(plot.id);
      const features = await WMS.getFeatures({
        bbox: [x - 1, y - 1, x + 1, y + 1].join(','),
        layers: ['GRB_ADP'],
      });
      const [feature] = features;
      const { coordinates: [outer] } = feature.geometry;
      const { segments, simplified } = simplifyPolygon(building.geometry);
      return [draw(segments).toDataURL(), draw(simplified).toDataURL()];
      // imageList.push(draw(segments).toDataURL());
      // imageList.push(draw(simplified).toDataURL());
    }),
  );*/
  // console.log(a);
  // res.send(html(images(...imageList)));
  console.log(chalk.bold.cyan(`${new Date().getTime() - time} ms`));
});

app.listen(PORT, () => {
  console.log(chalk.bold.white(`Listening on port ${PORT}.`));
});
