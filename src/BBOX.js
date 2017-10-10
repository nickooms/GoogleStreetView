class BBOX {
  constructor(...points) {
    Object.assign(this, {
      min: { x: Infinity, y: Infinity },
      max: { x: -Infinity, y: -Infinity },
    });
    this.add(points);
  }

  get width() {
    return this.max.x - this.min.x;
  }

  get height() {
    return this.max.y - this.min.y;
  }

  add(points) {
    points.forEach(([x, y]) => {
      const { min, max } = this;
      this.min = {
        x: Math.min(x, min.x),
        y: Math.min(y, min.y),
      };
      this.max = {
        x: Math.max(x, max.x),
        y: Math.max(y, max.y),
      };
    });
  }

  toString() {
    const { min, max } = this;
    return [min.x, min.y, max.x, max.y].join(',');
  }
}

export default BBOX;
