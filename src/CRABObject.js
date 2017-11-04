class CRABObject {
  constructor(x) {
    Object.assign(
      this,
      Object.entries(this.constructor.mapping)
        .map(([name, fn]) => [name, fn(x)])
        .reduce((obj, [name, value]) => {
          Object.assign(obj, { [name]: value });
          return obj;
        }, {}),
    );
  }
}

export default CRABObject;
