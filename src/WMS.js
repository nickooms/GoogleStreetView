import querystring from 'querystring';
import fetch from 'node-fetch';

const URL =
  'https://geoservices.informatievlaanderen.be/raadpleegdiensten/GRB/wms';

const service = 'WMS';

const format = 'image/png';
const transparent = 'TRUE';
const version = '1.3.0';
const width = '1536';
const height = '517';
const CRS = 'EPSG:31370';
// 'EPSG:4326'

const WMS = {
  getMap({ bbox, crs = CRS, layers = ['GRB_GBG'] }) {
    const request = 'GetMap';
    const styles = layers.join(',');
    const parameters = {
      service,
      request,
      format,
      transparent,
      styles,
      version,
      layers: layers.join(','),
      width,
      height,
      crs,
      bbox,
    };
    const url = `${URL}?${querystring.stringify(parameters)}`;
    return url;
  },
  getFeatureInfo({ bbox, crs = CRS, layers = ['GRB_ADP'] }) {
    const request = 'GetFeatureInfo';
    const styles = layers.join(',');
    const info_format = 'application/json';
    const query_layers = layers.join(',');
    const feature_count = 10;
    const parameters = {
      service,
      request,
      format,
      transparent,
      styles,
      version,
      layers: layers.join(','),
      width,
      height,
      crs,
      bbox,
      info_format,
      query_layers,
      feature_count,
      i: parseInt(width / 2, 10),
      j: parseInt(height / 2, 10),
    };
    const url = `${URL}?${querystring.stringify(parameters)}`;
    return url;
  },
  async getFeatures({ bbox, crs = CRS, layers = ['GRB_ADP'] }) {
    const url = WMS.getFeatureInfo({ bbox, crs, layers });
    const response = await fetch(url);
    const { features } = await response.json();
    return features;
  },
};

export default WMS;
