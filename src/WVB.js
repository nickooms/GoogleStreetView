import querystring from 'querystring';
import fetch from 'node-fetch';

const dir = object => {
  console.dir(object, { colors: true, depth: null });
  return object;
};

const WVB = async () => {
  const BASE_URL =
    'https://geoservices.informatievlaanderen.be/raadpleegdiensten/GRB/wms';
  const SERVICE = 'WMS';
  const REQUEST = 'GetFeatureInfo';
  const FORMAT = 'image/png';
  const TRANSPARENT = 'TRUE';
  // const LAYER = 'GRB_WBN';
  const LAYER = 'GRB_GBG';
  const LAYERS = [LAYER];
  const SIZE = 640;
  const WIDTH = SIZE;
  const HEIGHT = SIZE;
  const BBOX = [
    490221.8854926971,
    6675641.623703282,
    490673.6402731482,
    6675795.69208842,
  ];
  const INFO_FORMAT = 'application/json';
  const FEATURE_COUNT = 10;
  const CRS = 'EPSG:31370';
  const VERSION = '1.3.0';

  const layers = LAYERS.join(',');
  const width = WIDTH;
  const height = HEIGHT;
  const service = SERVICE;
  const request = REQUEST;
  const format = FORMAT;
  const transparent = TRANSPARENT;
  const styles = layers;
  const query_layers = layers;
  const info_format = INFO_FORMAT;
  const feature_count = FEATURE_COUNT;
  const crs = CRS;
  const bbox = BBOX.join(',');
  const version = VERSION;

  const parameters = {
    service,
    request,
    format,
    transparent,
    styles,
    version,
    layers,
    width,
    height,
    crs,
    bbox,
    info_format,
    query_layers,
    feature_count,
    i: 698,
    j: 303,
  };

  const url = `${BASE_URL}?${querystring.stringify(parameters)}`;

  const response = await fetch(url);
  const result = await response.json();

  dir(result);
  return result;
};

export default WVB;
