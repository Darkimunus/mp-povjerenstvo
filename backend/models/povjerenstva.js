import { pool } from "../db.js";

export const Povjerenstva = {
  getAllByOrgJed: async (idOrgJed) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        "SELECT ID_povjerenstva, naziv_povjerenstva, opis_povjerenstva, ID_org_jed FROM db_povjerenstva WHERE ID_org_jed = ?",
        [idOrgJed]
      );
      return rows;
    } finally {
      conn.release();
    }
  }
};
