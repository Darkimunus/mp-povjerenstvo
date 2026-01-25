import { pool } from "../db.js";

export const Zaposlenici = {
  getAll: async () => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email, lozinka, korisnik_aplikacije, status_zaposlenika FROM db_zaposlenici");
      return rows;
    } finally {
      conn.release();
    }
  },
  getDeleted: async () => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email, korisnik_aplikacije, status_zaposlenika FROM db_zaposlenici WHERE status_zaposlenika = 0");
      return rows;
    } finally {
      conn.release();
    }
  },
  getById: async (id) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email, lozinka, korisnik_aplikacije, status_zaposlenika FROM db_zaposlenici WHERE ID_zaposlenika = ?", [id]);
      return rows[0];
    } finally {
      conn.release();
    }
  },
  getByEmail: async (email) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email, lozinka, korisnik_aplikacije, status_zaposlenika FROM db_zaposlenici WHERE email = ?", [email]);
      return rows[0];
    } finally {
      conn.release();
    }
  },
  updateById: async (id, data) => {
    const conn = await pool.getConnection();
    try {
      const { ime_zaposlenika, prezime_zaposlenika, email, lozinka, korisnik_aplikacije, status_zaposlenika } = data;
      
      let query = "UPDATE db_zaposlenici SET ime_zaposlenika = ?, prezime_zaposlenika = ?, email = ?";
      const params = [ime_zaposlenika, prezime_zaposlenika, email];
      
      if (lozinka) {
        query += ", lozinka = ?";
        params.push(lozinka);
      }

      if (korisnik_aplikacije !== undefined && korisnik_aplikacije !== null) {
        query += ", korisnik_aplikacije = ?";
        params.push(korisnik_aplikacije);
      }

      if (status_zaposlenika !== undefined && status_zaposlenika !== null) {
        query += ", status_zaposlenika = ?";
        params.push(status_zaposlenika);
      }
      
      query += " WHERE ID_zaposlenika = ?";
      params.push(id);
      
      await conn.query(query, params);
      
      // Return updated user
      const rows = await conn.query("SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika, email, korisnik_aplikacije, status_zaposlenika FROM db_zaposlenici WHERE ID_zaposlenika = ?", [id]);
      return rows[0];
    } finally {
      conn.release();
    }
  },
  create: async (data) => {
    const conn = await pool.getConnection()
    try {
      const { ime_zaposlenika, prezime_zaposlenika, email, lozinka, korisnik_aplikacije } = data

      const result = await conn.query(
        `INSERT INTO db_zaposlenici
       (ime_zaposlenika, prezime_zaposlenika, email, lozinka, korisnik_aplikacije, status_zaposlenika)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [ime_zaposlenika, prezime_zaposlenika, email, lozinka, korisnik_aplikacije || 0, 1]
      )

      return {
        ID_zaposlenika: Number(result.insertId),
        ime_zaposlenika,
        prezime_zaposlenika,
        email,
        korisnik_aplikacije: korisnik_aplikacije || 0
      }
    } finally {
      conn.release()
    }
  },
  deleteById: async (id) => {
    const conn = await pool.getConnection()
    try {
      await conn.query(
        'UPDATE db_zaposlenici SET status_zaposlenika = 0, korisnik_aplikacije = 0 WHERE ID_zaposlenika = ?',
        [id]
      )
    } finally {
      conn.release()
    }
  },
  resetPasswordById: async (id, hashedPassword) => {
    const conn = await pool.getConnection()
    try {
      await conn.query(
        'UPDATE db_zaposlenici SET lozinka = ? WHERE ID_zaposlenika = ?',
        [hashedPassword, id]
      )
    } finally {
      conn.release()
    }
  },
  hasPovjerenstva: async (id) => {
    const conn = await pool.getConnection()
    try {
      const rows = await conn.query(
        'SELECT 1 FROM db_povjerenstva_po_zaposleniku WHERE ID_zaposlenika = ? LIMIT 1',
        [id]
      )
      return rows.length > 0
    } finally {
      conn.release()
    }
  }
};
