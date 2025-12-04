import { pool } from "../db.js";

export const AkademskeGodine = {
  getAll: async () => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_ak_godina, godina FROM db_akademske_godine");
      return rows;
    } finally {
      conn.release();
    }
  },

  getById: async (id) => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query("SELECT ID_ak_godina, godina FROM db_akademske_godine WHERE ID_ak_godina = ?", [id]);
      return rows[0] || null;
    } finally {
      conn.release();
    }
  },

  //KREIRANJE NOVE AKADEMSKE GODINE

  create: async (godina) => {
    const conn = await pool.getConnection();
    try{
      const result = await conn.query (
        "INSERT INTO db_akademske_godine (godina) values (?)",
        [godina]
      ); //const result zagrada

      return result.insertId.toString();
    } //try zagrada

    finally{
      conn.release();
    } //finally zagrada

  } //create zagrada

};
