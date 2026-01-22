import { pool } from "../db.js";

export const AkademskeGodine = {
  getAll: async () => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `
        SELECT ID_ak_godina, godina, aktivna_ak_godina
        FROM db_akademske_godine
        ORDER BY aktivna_ak_godina DESC, ID_ak_godina DESC
        `
      );
      return rows;
    } finally {
      conn.release();
    }
  },

  getById: async (id) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `
        SELECT ID_ak_godina, godina, aktivna_ak_godina
        FROM db_akademske_godine
        WHERE ID_ak_godina = ?
        `,
        [id]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  },

  /**
   * Kreira novu akademsku godinu i postavlja je kao aktivnu (1),
   * a sve ostale postavlja na neaktivne (0).
   */
  createAsActive: async (godina) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query("UPDATE db_akademske_godine SET aktivna_ak_godina = 0");

      const result = await conn.query(
        "INSERT INTO db_akademske_godine (godina, aktivna_ak_godina) VALUES (?, 1)",
        [godina]
      );

      await conn.commit();
      return result.insertId.toString();
    } catch (error) {
      try {
        await conn.rollback();
      } catch (_) {}
      throw error;
    } finally {
      conn.release();
    }
  },
};
