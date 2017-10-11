import { LocalStorage } from 'node-localstorage';

class Cache {
  constructor(...folders) {
    const path = `./${folders.join('/')}`;
    this.localStorage = new LocalStorage(path);
  }
}

export default Cache;
