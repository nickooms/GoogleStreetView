import CRAB from './CRAB';
import Street from './Street';
import CRABObj from './CRABObj';

const NAME = 'Gemeente';
const NAMES = `${NAME}n`;
const ID = `${NAME}Id`;
const FIND = `Find${NAMES}ByPostkanton`;

export default class City extends CRABObj {
  static NAME = NAME;
  static ID = ID;

  static mapping = x => ({
    id: +x[ID],
    name: x.GemeenteNaam,
    lang: x.TaalCodeGemeenteNaam,
    nis: +x.NISGemeenteCode,
  });

  static from = x => new City(x);

  static async find(zip) {
    const list = await CRAB(FIND, { PostkantonCode: zip });
    return list.map(City.from);
  }

  async street(name) {
    const [street] = await Street.byName(name, this.id);
    return street;
  }
}
