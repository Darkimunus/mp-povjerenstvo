import { pool } from "../db.js";

export const Zaposlenici = {
  getAll: async () => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email FROM db_zaposlenici");
      return rows;
    } finally {
      conn.release();
    }
  },
  getById: async (id) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email FROM db_zaposlenici WHERE ID_zaposlenika = ?", [id]);
      return rows[0];
    } finally {
      conn.release();
    }
  }
};
