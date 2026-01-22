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
  }, //getByPovjerenstvo zagrada

// kreiranje člana/mandata u povjerenstvu
  create: async ({
    ID_povjerenstva,
    ID_zaposlenika,
    uloga_clana,
    pocetak_mandata,
    kraj_mandata,
    procjena_radnih_sati,
    zamijenjeni_clan,
  }) => {
    const conn = await pool.getConnection();
    try {
      // 1) ako ne mijenja nikoga: postavi zamijenjeni_clan na sebe (radi NOT NULL + FK)
      const zamijenjeni = zamijenjeni_clan ? Number(zamijenjeni_clan) : Number(ID_zaposlenika);

      const result = await conn.query(
        `
        INSERT INTO db_povjerenstva_po_zaposleniku
          (uloga_clana, pocetak_mandata, kraj_mandata, procjena_radnih_sati, ID_povjerenstva, ID_zaposlenika, zamijenjeni_clan)
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          String(uloga_clana),
          String(pocetak_mandata),
          // ako korisnik ne upiše kraj mandata, spremi prazno (jer u dumpu je NOT NULL)
          // ako ste promijenili stupac da dopušta NULL, možeš ovo zamijeniti s null.
          kraj_mandata ? String(kraj_mandata) : "",
          String(procjena_radnih_sati),
          Number(ID_povjerenstva),
          Number(ID_zaposlenika),
          zamijenjeni,
        ]
      );

      return result.insertId.toString();
    } finally {
      conn.release();
    }
  },

};
