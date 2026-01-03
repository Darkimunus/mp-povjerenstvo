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
  }, 

  //TRAŽILICA + FILTERI
  searchByAkGodina: async (search, idAkGodina) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(`
      SELECT p.*
      FROM db_povjerenstva p
      JOIN db_organizacijske_jedinice o ON p.ID_org_jed = o.ID_org_jed
      WHERE o.ID_ak_godina = ?
        AND p.naziv_povjerenstva LIKE ?`, 
        [idAkGodina, `%${search}%`]);

    return rows;
  } finally {
      conn.release();
    }
},

   //DETALJI ZA PRIKAZ NA EKRANU DETALJA POVJERENSTVA
  getDetalji: async (idPovjerenstva) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(`
      SELECT
        p.naziv_povjerenstva,
        p.opis_povjerenstva,
        oj.naziv_org_jed,
        ag.godina
      FROM db_povjerenstva p
      JOIN db_organizacijske_jedinice oj ON oj.ID_org_jed = p.ID_org_jed
      JOIN db_akademske_godine ag ON ag.ID_ak_godina = oj.ID_ak_godina
      WHERE p.ID_povjerenstva = ?
    `, [idPovjerenstva]);

    return rows[0];
  } finally {
    conn.release();
  }
}

};
