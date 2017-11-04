import { LocalStorage } from 'node-localstorage';
import util from 'util';
import fs from 'fs';

const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);

class Cache {
  static async init(...folders) {
    const location = [];
    for (let folder of folders) {
      location.push(folder);
      const path = location.join('/');
      if (!await exists(path)) await mkdir(path);
    }
    return new Cache(...folders);
  }

  constructor(...folders) {
    const path = `./${folders.join('/')}`;
    this.localStorage = new LocalStorage(path);
  }

  set(key, item) {
    this.localStorage.setItem(key, JSON.stringify(item));
    return item;
  }

  get(key) {
    const item = this.localStorage.getItem(key);
    if (item) return JSON.parse(item);
    return null;
  }

  remove(key) {
    this.localStorage.removeItem(key);
  }
}

export default Cache;
