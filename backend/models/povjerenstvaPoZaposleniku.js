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
  }
};
