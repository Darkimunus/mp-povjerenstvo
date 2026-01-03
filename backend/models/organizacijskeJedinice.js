import { pool } from "../db.js";

export const OrganizacijskeJedinice = { 

  //dohvat svih org.jedinica po akademskoj godini
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

  //TRAŽILICA + FILTER
searchByAkGodina: async (search, idAkGodina) =>{
  const conn = await pool.getConnection();
  try {
      const rows = await conn.query(`
        SELECT *
        FROM db_organizacijske_jedinice
        WHERE ID_ak_godina = ?
          AND naziv_org_jed LIKE ?`, 
        [idAkGodina, `%${search}%`]);

      return rows;
  }finally {
      conn.release();
    }
}

};
