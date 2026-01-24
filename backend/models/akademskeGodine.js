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

  createAsActive: async (godina) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // nađi trenutno aktivnu godinu (iz nje kopiramo)
      const oldYearRows = await conn.query(
        "SELECT ID_ak_godina FROM db_akademske_godine WHERE aktivna_ak_godina = 1 LIMIT 1"
      );
      const oldYearId = oldYearRows?.[0]?.ID_ak_godina ? Number(oldYearRows[0].ID_ak_godina) : null;

      // sve godine na 0
      await conn.query("UPDATE db_akademske_godine SET aktivna_ak_godina = 0");

      // ubaci novu kao aktivnu
      const insertYearRes = await conn.query(
        "INSERT INTO db_akademske_godine (godina, aktivna_ak_godina) VALUES (?, 1)",
        [godina]
      );
      const newYearId = Number(insertYearRes.insertId);

      // kopiranje (ako postoji prethodna aktivna)
      if (oldYearId) {
        // kopiraj org jedinice i napravi mapu oldOrg -> newOrg
        const oldOrgs = await conn.query(
          "SELECT ID_org_jed, naziv_org_jed FROM db_organizacijske_jedinice WHERE ID_ak_godina = ?",
          [oldYearId]
        );

        const orgMap = new Map(); // oldOrgId -> newOrgId

        for (const org of oldOrgs) {
          const oldOrgId = Number(org.ID_org_jed);
          const naziv = org.naziv_org_jed;

          const insertOrgRes = await conn.query(
            "INSERT INTO db_organizacijske_jedinice (naziv_org_jed, ID_ak_godina) VALUES (?, ?)",
            [naziv, newYearId]
          );

          const newOrgId = Number(insertOrgRes.insertId);
          orgMap.set(oldOrgId, newOrgId);

          // za svaku org jedinicu kopiraj povjerenstva i napravi mapu oldPov -> newPov
          const oldPovs = await conn.query(
            "SELECT ID_povjerenstva, naziv_povjerenstva, opis_povjerenstva FROM db_povjerenstva WHERE ID_org_jed = ?",
            [oldOrgId]
          );

          const povMap = new Map(); // oldPovId -> newPovId

          for (const pov of oldPovs) {
            const oldPovId = Number(pov.ID_povjerenstva);

            const insertPovRes = await conn.query(
              "INSERT INTO db_povjerenstva (naziv_povjerenstva, opis_povjerenstva, ID_org_jed) VALUES (?, ?, ?)",
              [pov.naziv_povjerenstva, pov.opis_povjerenstva, newOrgId]
            );

            const newPovId = Number(insertPovRes.insertId);
            povMap.set(oldPovId, newPovId);

            //  kopiraj članove/mandate iz starog povjerenstva u novo
            const oldMembers = await conn.query(
              `
              SELECT
                uloga_clana, pocetak_mandata, kraj_mandata,
                procjena_radnih_sati, ID_zaposlenika, zamijenjeni_clan
              FROM db_povjerenstva_po_zaposleniku
              WHERE ID_povjerenstva = ?
              `,
              [oldPovId]
            );

            for (const m of oldMembers) {
              // ako je kraj_mandata NOT NULL, pazimo da ne šaljemo null
              const kraj = m.kraj_mandata ?? "";

              // ako je zamijenjeni_clan NOT NULL, a u starim podacima je prazno,
              // fallback na ID_zaposlenika (najsigurnije)
              const zamijenjeni =
                m.zamijenjeni_clan ? Number(m.zamijenjeni_clan) : Number(m.ID_zaposlenika);

              await conn.query(
                `
                INSERT INTO db_povjerenstva_po_zaposleniku
                  (uloga_clana, pocetak_mandata, kraj_mandata, procjena_radnih_sati, ID_povjerenstva, ID_zaposlenika, zamijenjeni_clan)
                VALUES
                  (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                  m.uloga_clana,
                  m.pocetak_mandata,
                  kraj,
                  m.procjena_radnih_sati,
                  newPovId,
                  Number(m.ID_zaposlenika),
                  zamijenjeni,
                ]
              );
            }
          }
        }
      }

      await conn.commit();
      return newYearId.toString();
    } catch (error) {
      try {
        await conn.rollback();
      } catch (_) {}
      throw error;
    } finally {
      conn.release();
    }
  },

isActive: async (idAkGodina) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      "SELECT aktivna_ak_godina FROM db_akademske_godine WHERE ID_ak_godina = ? LIMIT 1",
      [Number(idAkGodina)]
    );
    if (!rows?.[0]) return false;
    return Number(rows[0].aktivna_ak_godina) === 1;
  } finally {
    conn.release();
  }
},

};
