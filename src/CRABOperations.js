const ID = 'ID';
const N = 'N';
const S = 'S';
const AMEN = 'AMEN';
const ALEN = 'ALEN';
const ATEN = 'ATEN';
const CODE = 'CODE';
const IDENTIFICATOR = 'IDENTIFICATOR';
const EN = 'EN';
const SEN = 'SEN';
const ELEN = 'ELEN';

const Gemeente = 'Gemeente';
const Huisnummer = 'Huisnummer';
const Straatnaam = 'Straatnaam';
const Subadres = 'Subadres';
const Gebouw = 'Gebouw';
const Postkanton = 'Postkanton';
const Terreinobject = 'Terreinobject';
const Wegobject = 'Wegobject';
const Wegsegment = 'Wegsegment';
const Gewest = 'Gewest';
const HerkomstAdrespositie = 'HerkomstAdrespositie';
const Organisatie = 'Organisatie';
const Taal = 'Taal';
const Perceel = 'Perceel';
const Adrespositie = 'Adrespositie';
const RijksregisterAdres = 'RijksregisterAdres';
const Postadres = 'Postadres';
const RijksregisterStraat = 'RijksregisterStraat';
const Adres = 'Adres';

const CRAB = {
  Def: {
    Gemeente: [ID, N],
    Huisnummer: [ID, S],
    Straatnaam: [ID, AMEN],
    NISGemeente: [CODE],
    Gebouw: [IDENTIFICATOR, EN],
    Adrespositie: [ID, S],
    Postkanton: [S],
    Subadres: [ID, SEN],
    Gewest: [ID, EN],
    Perceel: [IDENTIFICATOR, ELEN],
    Terreinobject: [IDENTIFICATOR, EN],
    Wegobject: [IDENTIFICATOR, EN],
    Wegsegment: [IDENTIFICATOR, EN],
    Taal: [CODE, ALEN],
    RijksregisterStraat: [CODE, ATEN],
    RijksregisterAdres: [ID],
    Herkomst: [],
    Aard: [],
    Status: [],
    Adres: [SEN],
  },
  Find: {
    By: { Postkanton: [Gemeente], Gemeente, Huisnummer, Straatnaam, Subadres },
    ByWithStatus: { Huisnummer, Straatnaam, Subadres },
  },
  Get: {
    By: { Huisnummer, Straatnaam },
    ByID: {
      Adrespositie,
      Gebouw,
      Gemeente,
      NISGemeente: [Gemeente],
      Huisnummer: [Huisnummer, Postadres, Postkanton],
      Perceel,
      Subadres: [Postadres, Subadres],
      RijksregisterStraat: [RijksregisterStraat, Straatnaam],
      Terreinobject,
      Wegobject,
      Wegsegment,
    },
    ByWithStatus: { Huisnummer, Straatnaam },
    ByIdWithStatus: { Huisnummer, RijksregisterStraat: [Straatnaam], Subadres },
    ByNaam: { Gemeente },
    ByIDAndID: { Taal: [Gewest] },
  },
  List: {
    By: {
      Huisnummer: [Adrespositie, Gebouw, Perceel, RijksregisterAdres],
      Subadres: [Adrespositie],
    },
    ById: {
      Huisnummer: [
        Adrespositie,
        Gebouw,
        Perceel,
        RijksregisterAdres,
        Subadres,
        Terreinobject,
      ],
      Subadres: [Adrespositie, RijksregisterAdres],
      Gewest: [Gemeente],
      Terreinobject: [Huisnummer],
      Straatnaam: [
        Huisnummer,
        Postadres,
        RijksregisterStraat,
        Wegobject,
        Wegsegment,
      ],
      Gemeente: [Postkanton, Straatnaam],
      Wegobject: [Straatnaam],
    },
    ByIdWithStatus: {
      Gebouw: [Huisnummer],
      Perceel: [Huisnummer],
      Terreinobject: [Huisnummer],
      RijksregisterAdres: [Huisnummer, Subadres],
      Straatnaam: [Huisnummer],
      Gemeente: [Straatnaam],
      Wegobject: [Straatnaam],
      Wegsegment: [Straatnaam],
      Huisnummer: [Subadres],
    },
    Aard: [Adres, Gebouw, Subadres, Terreinobject, Wegobject],
    Geometriemethode: [Gebouw, Wegsegment],
    Gewest,
    HerkomstAdrespositie,
    Organisatie,
    Status: [Gebouw, Huisnummer, Straatnaam, Subadres, Wegsegment],
    Taal,
  },
};

export default CRAB;
