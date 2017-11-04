import CRAB from './CRAB';
import CRABObject from './CRABObject';

class Plot extends CRABObject {
  static async byId(id) {
    const result = await CRAB('GetPerceelByIdentificatorPerceel', {
      IdentificatorPerceel: id,
    });
    return result.map(plot => new Plot(plot));
  }

  static async byHousenumberId(housenumberId) {
    const result = await CRAB('ListPercelenByHuisnummerId', {
      HuisnummerId: housenumberId,
    });
    return result.map(plot => new Plot(plot));
  }
}

Plot.mapping = {
  id: x => x.IdentificatorPerceel,
  center: x =>
    x.CenterX
      ? { x: +x.CenterX.replace(',', '.'), y: +x.CenterY.replace(',', '.') }
      : undefined,
};

export default Plot;
