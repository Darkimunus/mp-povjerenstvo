import { Izvjestaji } from "../models/izvjestaji.js";

export const izvjestajiController = {

  //// GET /api/izvjestaji/sastav-povjerenstava?idAkGodina=1
  sastavPovjerenstava: async (req, res) => {
    try {
      const idAkGodina = Number(req.query.idAkGodina);
      if (!idAkGodina) {
        return res.status(400).json({ error: "Nedostaje idAkGodina." });
      }

      const report = await Izvjestaji.getSastavPovjerenstva({ idAkGodina });
      res.json(report);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  // GET /api/izvjestaji/sudjelovanje-zaposlenika?idAkGodina=1&idZaposlenika=2
  sudjelovanjeZaposlenika: async (req, res) => {
    try {
      const idAkGodina = Number(req.query.idAkGodina);
      const idZaposlenika = Number(req.query.idZaposlenika);

      if (!idAkGodina) {
        return res.status(400).json({ error: "Nedostaje idAkGodina." });
      }
      if (!idZaposlenika) {
        return res.status(400).json({ error: "Nedostaje idZaposlenika." });
      }

      const report = await Izvjestaji.getSudjelovanjeZaposlenika({ idAkGodina, idZaposlenika });
      if (!report) {
        return res.status(404).json({ error: "Zaposlenik nije pronađen." });
      }

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  mandatiPriIsteku: async (req, res) => {
    try {
      const rows = await Izvjestaji.getMandatiPriIsteku();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
