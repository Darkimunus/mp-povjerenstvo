import { pool } from "../db.js";

export const OrganizacijskeJedinice = {
  getAllByAkGodina: async (idAkGodina) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        "SELECT ID_org_jed, naziv_org_jed, ID_ak_godina FROM db_organizacijske_jedinice WHERE ID_ak_godina = ?",
        [idAkGodina]
      );
      return rows;
    } finally {
      conn.release();
    }
  },

  searchByAkGodina: async (search, idAkGodina) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `
        SELECT ID_org_jed, naziv_org_jed, ID_ak_godina
        FROM db_organizacijske_jedinice
        WHERE ID_ak_godina = ?
          AND naziv_org_jed LIKE ?
        `,
        [idAkGodina, `%${search}%`]
      );
      return rows;
    } finally {
      conn.release();
    }
  },

  create: async (naziv_org_jed, idAkGodina) => {
    const conn = await pool.getConnection();
    try {
      const result = await conn.query(
        "INSERT INTO db_organizacijske_jedinice (naziv_org_jed, ID_ak_godina) VALUES (?, ?)",
        [naziv_org_jed, idAkGodina]
      );
      return result.insertId.toString();
    } finally {
      conn.release();
    }
  },
};
