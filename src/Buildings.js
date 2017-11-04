import CRAB from './CRAB';
import CRABObject from './CRABObject';

class Buildings extends CRABObject {
  static async byHousenumberId(housenumberId) {
    const result = await CRAB('ListGebouwenByHuisnummerId', {
      HuisnummerId: housenumberId,
    });
    return result.map(building => new Buildings(building));
  }
}

Buildings.mapping = {
  id: x => +x.IdentificatorGebouw,
  kind: x => +x.AardGebouw,
  status: x => +x.StatusGebouw,
};

export default Buildings;
