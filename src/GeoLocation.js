import querystring from 'querystring';
import fetch from 'node-fetch';

import Cache from './Cache';

const URL = `https://maps.googleapis.com/maps/api/geocode/json`;
const key = 'AIzaSyCkPMlbht7FJQ8FJokGLZFngLXW2LHel24';
const result_type = 'street_address';

class GeoLocation {
  static async reverse({ longitude, latitude }) {
    const cache = await Cache.init('cache', 'GeoLocation', 'reverse');
    const latlng = `${latitude},${longitude}`;
    const parameters = { latlng, result_type, key };
    const cached = cache.get(latlng);
    if (cached) return cached;
    const url = `${URL}?${querystring.stringify(parameters)}`;
    const response = await fetch(url);
    const json = await response.json();
    const type = typeName => object => object.types.includes(typeName);
    const find = (object, propertyName) => object.find(type(propertyName));
    const streetAddress = find(json.results, 'street_address');
    const { address_components: address } = streetAddress;
    const housenumbers = find(address, 'street_number').long_name.split('-');
    const street = find(address, 'route').long_name;
    const zip = +find(address, 'postal_code').long_name;
    const result = { street, zip, housenumbers };
    cache.set(latlng, result);
    return result;
  }
}

export default GeoLocation;
