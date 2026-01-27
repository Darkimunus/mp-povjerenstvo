import { pool } from "../db.js";

export const Izvjestaji = {
  /**
   * 1. Izvještaj o sastavu povjerenstva za odabranu akademsku godinu.
   */
  getSastavPovjerenstva: async ({ idAkGodina }) => {
    const conn = await pool.getConnection();
    try {
      const [akGodineRows] = await conn.query(
        `SELECT godina FROM db_akademske_godine 
      WHERE ID_ak_godina = ? LIMIT 1`,
        [idAkGodina]
      );

      const rows = await conn.query(`
      SELECT
        p.ID_povjerenstva,
        p.naziv_povjerenstva,
        oj.naziv_org_jed,
        z.ime_zaposlenika,
        z.prezime_zaposlenika,
        z2.ime_zaposlenika AS zamijenjeni_clan_ime,
        z2.prezime_zaposlenika AS zamijenjeni_clan_prezime,
        ppz.uloga_clana,
        ppz.zamijenjeni_clan AS zamjenik,
        ppz.pocetak_mandata AS mandat_od,
        ppz.kraj_mandata AS mandat_do,
        ppz.procjena_radnih_sati
      FROM db_povjerenstva p
      JOIN db_organizacijske_jedinice oj ON oj.ID_org_jed = p.ID_org_jed
      JOIN db_povjerenstva_po_zaposleniku ppz ON ppz.ID_povjerenstva = p.ID_povjerenstva
      JOIN db_zaposlenici z ON z.ID_zaposlenika = ppz.ID_zaposlenika
      LEFT JOIN db_zaposlenici z2 ON z2.ID_zaposlenika = ppz.zamijenjeni_clan
      WHERE oj.ID_ak_godina = ?
      ORDER BY p.naziv_povjerenstva, ppz.uloga_clana
    `, [idAkGodina]);

      return {
        akademskaGodina: akGodineRows.length ? akGodineRows[0].godina : '',
        stavke: rows
      };
    } finally {
      conn.release();
    }
  },

  /**
   * 2. Izvještaj o sudjelovanju zaposlenika u povjerenstvima za odabranu akademsku godinu.
   */
  getSudjelovanjeZaposlenika: async ({ idAkGodina, idZaposlenika }) => {
    const conn = await pool.getConnection();
    try {
      const [zaposlenik] = await conn.query(
        `SELECT ID_zaposlenika, ime_zaposlenika, prezime_zaposlenika
         FROM db_zaposlenici
         WHERE ID_zaposlenika = ?
         LIMIT 1`,
        [Number(idZaposlenika)]
      ); //const

      if (!zaposlenik) return null;

      const [akGodina] = await conn.query(
        `SELECT ID_ak_godina, godina
         FROM db_akademske_godine
         WHERE ID_ak_godina = ?
         LIMIT 1`,
        [Number(idAkGodina)]
      );

      const rows = await conn.query(
        `
        SELECT
          oj.naziv_org_jed         AS naziv_org_jedinice,
          p.naziv_povjerenstva     AS naziv_povjerenstva,
          ppz.uloga_clana          AS uloga,
          ppz.procjena_radnih_sati AS procjena_radnih_sati
        FROM db_povjerenstva_po_zaposleniku ppz
        JOIN db_povjerenstva p
          ON p.ID_povjerenstva = ppz.ID_povjerenstva
        JOIN db_organizacijske_jedinice oj
          ON oj.ID_org_jed = p.ID_org_jed
        WHERE ppz.ID_zaposlenika = ?
          AND oj.ID_ak_godina = ?
        ORDER BY oj.naziv_org_jed, p.naziv_povjerenstva
        `,
        [Number(idZaposlenika), Number(idAkGodina)]
      );

      const brojPovjerenstava = Array.isArray(rows) ? rows.length : 0;

      // procjena_radnih_sati je varchar u bazi -> parsiranje u JS-u
      const ukupnoSati = (Array.isArray(rows) ? rows : []).reduce((acc, r) => {
        const val = Number(String(r.procjena_radnih_sati ?? "0").replace(",", "."));
        return acc + (Number.isFinite(val) ? val : 0);
      }, 0);

      return {
        zaposlenik: {
          id: zaposlenik.ID_zaposlenika,
          ime: zaposlenik.ime_zaposlenika,
          prezime: zaposlenik.prezime_zaposlenika,
        },
        akademskaGodina: akGodina
          ? { id: akGodina.ID_ak_godina, godina: akGodina.godina }
          : { id: Number(idAkGodina), godina: "" },
        stavke: rows,
        ukupno: {
          brojPovjerenstava,
          ukupnaProcjenaRadnihSati: ukupnoSati,
        },
      };
    } finally {
      conn.release();
    }
  },

  /**
   * 3. Izvještaj: Mandati pri isteku (predsjednik / zamjenik predsjednika).
   * Vraća sve zapise koji imaju kraj_mandata != '' i ulogu predsjednik/zamjenik.
   * Filtriranje "unutar 3 mjeseca / status" radi frontend (jer je kraj_mandata VARCHAR).
   */
  getMandatiPriIsteku: async () => {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        `
      SELECT
        z.ime_zaposlenika       AS ime,
        z.prezime_zaposlenika   AS prezime,
        ppz.kraj_mandata        AS krajMandata,
        p.naziv_povjerenstva    AS povjerenstvo,
        ppz.uloga_clana         AS uloga
      FROM db_povjerenstva_po_zaposleniku ppz
      JOIN db_zaposlenici z
        ON z.ID_zaposlenika = ppz.ID_zaposlenika
      JOIN db_povjerenstva p
        ON p.ID_povjerenstva = ppz.ID_povjerenstva
      JOIN db_organizacijske_jedinice oj
        ON oj.ID_org_jed = p.ID_org_jed
      JOIN db_akademske_godine ag
        ON ag.ID_ak_godina = oj.ID_ak_godina
      WHERE
        ag.aktivna_ak_godina = 1
        AND ppz.kraj_mandata <> ''
        AND (
          LOWER(ppz.uloga_clana) = 'predsjednik'
          OR LOWER(ppz.uloga_clana) = 'zamjenik predsjednika'
        )
      ORDER BY
        ppz.kraj_mandata, z.prezime_zaposlenika, z.ime_zaposlenika, p.naziv_povjerenstva
      `
      );

      return rows;
    } finally {
      conn.release();
    }
  },

};
