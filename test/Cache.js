import assert from 'assert';
import util from 'util';
import fs from 'fs';

import Cache from '../src/Cache';

const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);

const getCache = () => new Cache('cache', 'test');

describe('Cache', () => {
  before(async () => {
    if (!await exists('cache')) await mkdir('cache');
  });

  it('should initialize', done => {
    getCache();
    done();
  });

  it('should set items', done => {
    const cache = getCache();
    cache.set('test-key', 'test-value');
    done();
  });

  it('should get items', done => {
    const cache = getCache();
    assert.equal(cache.get('test-key'), 'test-value');
    done();
  });
});
