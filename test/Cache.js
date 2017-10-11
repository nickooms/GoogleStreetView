import assert from 'assert';
import util from 'util';
import fs from 'fs';

import Cache from '../src/Cache';

const mkdir = util.promisify(fs.mkdir);

describe('Cache', () => {
  before(async () => {
    await mkdir('cache');
  });

  it('should initialize', done => {
    const cache = new Cache('cache', 'test');
    console.log(cache);
    /* http.get(URL, res => {
      assert.equal(200, res.statusCode);
      done();
    });*/
  });
});
