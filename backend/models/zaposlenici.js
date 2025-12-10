import { pool } from "../db.js";

export const Zaposlenici = {
  getAll: async () => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email, lozinka FROM db_zaposlenici");
      return rows;
    } finally {
      conn.release();
    }
  },
  getById: async (id) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email, lozinka FROM db_zaposlenici WHERE ID_zaposlenika = ?", [id]);
      return rows[0];
    } finally {
      conn.release();
    }
  },
  getByEmail: async (email) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email, lozinka FROM db_zaposlenici WHERE email = ?", [email]);
      return rows[0];
    } finally {
      conn.release();
    }
  },
  updateById: async (id, data) => {
    const conn = await pool.getConnection();
    try {
      const { ime_zaposlenika, prezime_zaposlenika, email, lozinka } = data;
      
      let query = "UPDATE db_zaposlenici SET ime_zaposlenika = ?, prezime_zaposlenika = ?, email = ?";
      const params = [ime_zaposlenika, prezime_zaposlenika, email];
      
      if (lozinka) {
        query += ", lozinka = ?";
        params.push(lozinka);
      }
      
      query += " WHERE ID_zaposlenika = ?";
      params.push(id);
      
      await conn.query(query, params);
      
      // Return updated user
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email FROM db_zaposlenici WHERE ID_zaposlenika = ?", [id]);
      return rows[0];
    } finally {
      conn.release();
    }
  }
};
