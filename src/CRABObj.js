export default class CRABObj {
  constructor(x) {
    Object.assign(this, this.constructor.mapping(x));
  }
}
