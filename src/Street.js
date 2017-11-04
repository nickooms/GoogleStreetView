import CRAB from './CRAB';
import CRABObj from './CRABObj';
import Housenumber from './Housenumber';
import City from './City';
import { flatten } from './util';

const NAME = 'Straatnaam';
const NAMES = 'Straatnamen';
const ID = `${NAME}Id`;
const FIND = `Find${NAMES}`;

export default class Street extends CRABObj {
  static NAME = NAME;
  static ID = ID;
  static mapping = x => ({
    id: +x[ID],
    name: x[NAME],
    lang: x.TaalCode,
  });

  static from = x => new Street(x);

  static async byName(name, city) {
    const list = await CRAB(FIND, {
      [NAME]: name,
      [City.ID]: city,
    });
    return list.map(Street.from);
  }

  housenumbers = async () => Housenumber.byStreet(this.id);

  buildings = async () => {
    const housenumbers = await this.housenumbers();
    const list = housenumbers.map(async item => (await item.buildings())
      .map(building => Object.assign(building, { number: item.number })));
    return flatten(await Promise.all(list));
  };
}
