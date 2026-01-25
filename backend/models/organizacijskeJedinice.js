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
  // ✅ NOVO: dohvat jedne org. jedinice po ID-u
  getById: async (idOrgJed) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        "SELECT ID_org_jed, naziv_org_jed, ID_ak_godina FROM db_organizacijske_jedinice WHERE ID_org_jed = ? LIMIT 1",
        [Number(idOrgJed)]
      );
      return rows?.[0] ?? null;
    } finally {
      conn.release();
    }
  },

  // ✅ NOVO: update naziva
  updateNaziv: async (idOrgJed, naziv_org_jed) => {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        "UPDATE db_organizacijske_jedinice SET naziv_org_jed = ? WHERE ID_org_jed = ?",
        [String(naziv_org_jed), Number(idOrgJed)]
      );
      return true;
    } finally {
      conn.release();
    }
  },
};
