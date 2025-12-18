import { pool } from "../db.js";

export const PovjerenstvaPoZaposleniku = {

  getByZaposlenik: async (idZaposlenika) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `SELECT ID_povjerenstva_po_zaposleniku, uloga_clana, pocetak_mandata, kraj_mandata, procjena_radnih_sati, ID_povjerenstva, ID_zaposlenika, zamijenjeni_clan 
         FROM db_povjerenstva_po_zaposleniku 
         WHERE ID_zaposlenika = ?`,
        [idZaposlenika]
      );
      return rows;
    } finally {
      conn.release();
    }
  },

  //za prikaz povjerenstva detalji
  getByPovjerenstvo: async (idPovjerenstva) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `
        SELECT
          ppz.ID_povjerenstva_po_zaposleniku,
          ppz.uloga_clana,
          ppz.pocetak_mandata,
          ppz.kraj_mandata,
          ppz.procjena_radnih_sati,

          z1.ime_zaposlenika AS clan_ime,
          z1.prezime_zaposlenika AS clan_prezime,

          z2.ime_zaposlenika AS zamjena_ime,
          z2.prezime_zaposlenika AS zamjena_prezime

        FROM db_povjerenstva_po_zaposleniku ppz
        JOIN db_zaposlenici z1
          ON z1.ID_zaposlenika = ppz.ID_zaposlenika
        LEFT JOIN db_zaposlenici z2
          ON z2.ID_zaposlenika = ppz.zamijenjeni_clan
        WHERE ppz.ID_povjerenstva = ?
        `,
        [idPovjerenstva]
      );
      return rows;
    } finally {
      conn.release();
    } //finally zagrada
  } //getByPovjerenstvo zagrada

};
