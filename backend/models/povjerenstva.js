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
        ag.godina,
        ag.aktivna_ak_godina
      FROM db_povjerenstva p
      JOIN db_organizacijske_jedinice oj ON oj.ID_org_jed = p.ID_org_jed
      JOIN db_akademske_godine ag ON ag.ID_ak_godina = oj.ID_ak_godina
      WHERE p.ID_povjerenstva = ?
    `, [idPovjerenstva]);

    return rows[0];
  } finally {
    conn.release();
  }
},
 create: async (naziv_povjerenstva, opis_povjerenstva, idOrgJed) => {
    const conn = await pool.getConnection();
    try {
      const result = await conn.query(
        `
        INSERT INTO db_povjerenstva (naziv_povjerenstva, opis_povjerenstva, ID_org_jed)
        VALUES (?, ?, ?)
        `,
        [naziv_povjerenstva, opis_povjerenstva, idOrgJed]
      );

      return result.insertId.toString();
    } finally {
      conn.release();
    }
  },

  //provjera je li akademska godina aktivna
  isOrgJedInActiveYear: async (idOrgJed) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `
      SELECT ag.aktivna_ak_godina
      FROM db_organizacijske_jedinice oj
      JOIN db_akademske_godine ag ON ag.ID_ak_godina = oj.ID_ak_godina
      WHERE oj.ID_org_jed = ?
      LIMIT 1
      `,
      [Number(idOrgJed)]
    );
    if (!rows?.[0]) return false;
    return Number(rows[0].aktivna_ak_godina) === 1;
  } finally {
    conn.release();
  }
},
// dohvat povjerenstva po ID-u
getById: async (idPovjerenstva) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      "SELECT ID_povjerenstva, naziv_povjerenstva, opis_povjerenstva, ID_org_jed FROM db_povjerenstva WHERE ID_povjerenstva = ? LIMIT 1",
      [Number(idPovjerenstva)]
    );
    return rows?.[0] ?? null;
  } finally {
    conn.release();
  }
},

//  update naziva + opisa
update: async (idPovjerenstva, naziv_povjerenstva, opis_povjerenstva) => {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      "UPDATE db_povjerenstva SET naziv_povjerenstva = ?, opis_povjerenstva = ? WHERE ID_povjerenstva = ?",
      [String(naziv_povjerenstva), String(opis_povjerenstva), Number(idPovjerenstva)]
    );
    return true;
  } finally {
    conn.release();
  }
},
};
