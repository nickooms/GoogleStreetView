import paper from 'paper-jsdom-canvas';
import simplify from 'simplify-js';
import express from 'express';
import fetch from 'node-fetch';
import chalk from 'chalk';

import { PORT } from './constants';
import StreetView from './StreetView';
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

const image = src => `
<html>
  <body style="margin: 0px;">
    <img src="${src}">
  </body>
</html>
`;

const app = express();

app.use(express.static('public'));

app.get('/location/:lonLat', async ({ params: { lonLat } }, res) => {
  const [longitude, latitude] = lonLat.split(',').map(parseFloat);
  // const location = { longitude, latitude };
  // let src = StreetView.url(location);
  // const metadata = StreetView.metadata(location);
  // let result = await fetch(metadata);
  // let json = await result.json();
  // const src = json.pano_id ? getPano(json.pano_id) : StreetView.url(location);
  const reverse = StreetView.reverse({ latitude, longitude });
  const result = await fetch(reverse);
  const json = await result.json();
  const type = typeName => x => x.types.includes(typeName);
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
  const layers = ['GRB_ADP', 'GRB_GBG'];
  const featuresUrl = WMS.getFeatureInfo({
    bbox: [x - 1, y - 1, x + 1, y + 1].join(','),
    layers,
  });
  const featuresResponse = await fetch(featuresUrl);
  const { features } = await featuresResponse.json();
  const [feature] = features;
  const { coordinates: [outer] } = feature.geometry;
  // const { viewport: { northeast, southwest } } = geometry;
  /// const lat = [northeast.lat, southwest.lat];
  // const lng = [northeast.lng, southwest.lng];
  // const min = { x: Math.min(...lat), y: Math.min(...lng) };
  // const max = { x: Math.max(...lat), y: Math.max(...lng) };
  // const bbox = [min.x, min.y, max.x, max.y].join(',');
  /* const list = {
    x: outer.map(([x]) => x),
    y: outer.map(([x, y]) => y),
  };
  const min = {
    x: Math.min(...list.x),
    y: Math.min(...list.y),
  };
  const max = {
    x: Math.max(...list.x),
    y: Math.max(...list.y),
  };*/
  const bbox = new BBOX(...outer);
  // const url = WMS.getMap({ bbox: bbox.toString(), layers });
  // res.send(image(url));
  /* const segments = [
    new paper.Point(100, 100),
    new paper.Point(200, 200),
  ];*/
  // dir(outer);
  // dir(bbox);
  const subtract = point => ([x, y]) => [x - point.x, y - point.y];
  const multiply = factor => ([x, y]) => [x * factor, y * factor];
  const segments = outer.map(subtract(bbox.min)).map(multiply(10));
  // console.log(segments);
  const arrayToPoint = ([x, y]) => ({ x, y });
  const pointToArray = ({ x, y }) => [x, y];
  const simplified = simplify(segments.map(arrayToPoint), 1, true).map(
    pointToArray,
  );
  console.log(simplified);
  const { width, height } = new BBOX(...simplified);
  const w = Math.ceil(width);
  const h = Math.ceil(height);
  const canvas = paper.createCanvas(w, h);
  paper.setup(canvas);
  const path = new paper.Path({
    segments /* : simplified*/,
    strokeColor: 'black',
    // fullySelected: true,
  });
  // path.flatten(0.025);
  console.log(
    `${segments.length - 1} points => ${simplified.length - 1} points`,
  );
  /* const start = new paper.Point(100, 100);
  path.moveTo(start);
  path.lineTo(start.add([200,-50]));*/
  paper.view.draw();
  res.send(image(canvas.toDataURL()));
});

app.listen(PORT, () => {
  console.log(chalk.bold.white(`Listening on port ${PORT}.`));
});
