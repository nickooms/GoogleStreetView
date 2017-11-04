import CRAB from './CRAB';
import CRABObject from './CRABObject';
import Street from './Street';
import Building from './Building';

const NAME = 'Huisnummer';
const NAMES = `${NAME}s`;
const ID = `${NAME}Id`;
const FIND = `Find${NAMES}`;
const GET = `Get${NAME}By${ID}`;

export default class Housenumber extends CRABObject {
  static NAME = NAME;
  static ID = ID;
  static mapping = {
    id: x => +x[ID],
    number: x => x[NAME],
  };

  static from = x => new Housenumber(x);

  static async byNumber(number, streetId) {
    const result = await CRAB(FIND, {
      [NAME]: number,
      [Street.ID]: streetId,
    });
    return result.map(Housenumber.from);
  }

  static async get(id) {
    const [item] = await CRAB(GET, { [ID]: id });
    return Housenumber.from(item);
  }

  static async byStreet(id) {
    const ref = Street.ID;
    const list = await CRAB(`List${NAME}sBy${ref}`, { [ref]: id });
    return Promise.all(list.map(x => x[ID]).map(Housenumber.get));
  }

  buildings = async () => Building.byHousenumber(this.id);
}
