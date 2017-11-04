import CRAB from './CRAB';
import CRABObj from './CRABObj';
import Housenumber from './Housenumber';
import { polygon } from './util';

const NAME = 'Gebouw';
const NAMES = `${NAME}en`;
const ID = `Identificator${NAME}`;
const GET = `Get${NAME}By${ID}`;

export default class Building extends CRABObj {
  static NAME = NAME;
  static ID = ID;
  static mapping = x => ({
    id: +x.IdentificatorGebouw,
    kind: +x.AardGebouw,
    status: +x.StatusGebouw,
    geometryMethod: +x.GeometriemethodeGebouw,
    geometry: polygon(x.Geometrie),
    beginOperation: +x.BeginBewerking,
    beginOrganization: +x.BeginOrganisatie,
  });

  static from = x => new Building(x);

  static async get(id) {
    const [item] = await CRAB(GET, { [ID]: id });
    return Building.from(item);
  }

  static async byHousenumber(id) {
    const ref = Housenumber.ID;
    const list = await CRAB(`List${NAMES}By${ref}`, { [ref]: id });
    return Promise.all(list.map(x => +x[ID]).map(Building.get));
  }
}
