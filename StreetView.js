const querystring = require('querystring');

const BASE_URL = 'https://maps.googleapis.com/maps/api/streetview';
const KEY = 'AIzaSyCkPMlbht7FJQ8FJokGLZFngLXW2LHel24';

const WIDTH = 640;
const HEIGHT = 640;
const FOV = 90;
const HEADING = 235;
const PITCH = 10;

const StreetView = {
  size({ width = WIDTH, height = HEIGHT }) {
    return `${width}x${height}`;
  },
  location({ longitude, latitude }) {
    return `${latitude},${longitude}`;
  },
  getUrl(parameters, path = '') {
    return `${BASE_URL}${path}?${querystring.stringify(parameters)}`
  },
  url({ width = WIDTH, height = HEIGHT, fov = FOV, heading = HEADING, pitch = PITCH, longitude, latitude }) {
    const size = this.size({ width, height });
    const location = this.location({ longitude, latitude });
    return this.getUrl({ size, location, fov, heading, pitch, key: KEY });
  },
  metadata({ width = WIDTH, height = HEIGHT, fov = FOV, heading = HEADING, pitch = PITCH, longitude, latitude }) {
    const size = this.size({ width, height });
    const location = this.location({ longitude, latitude });
    return this.getUrl({ size, location, fov, heading, pitch, key: KEY }, '/metadata');
  },
  pano({ width = WIDTH, height = HEIGHT, pano }) {
    const size = this.size({ width, height });
    return this.getUrl({ size, pano });
  }
};

module.exports = StreetView;
