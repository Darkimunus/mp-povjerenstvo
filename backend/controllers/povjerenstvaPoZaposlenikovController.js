import { PovjerenstvaPoZaposleniku } from "../models/povjerenstvaPoZaposleniku.js";

export const povjerenstvaPoZaposlenikovController = {
  getByZaposlenik: async (req, res) => {
    try {
      const { idZaposlenika } = req.params;
      const povjerenstva = await PovjerenstvaPoZaposleniku.getByZaposlenik(idZaposlenika);
      res.json(povjerenstva);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getByPovjerenstvo: async (req, res) => {
  try {
    const idPovjerenstva = Number(req.params.idPovjerenstva);
    const clanovi = await PovjerenstvaPoZaposleniku.getByPovjerenstvo(idPovjerenstva);
    res.json(clanovi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},
// create član/mandat
  create: async (req, res) => {
    try {
      const {
        ID_povjerenstva,
        ID_zaposlenika,
        uloga_clana,
        pocetak_mandata,
        kraj_mandata,
        procjena_radnih_sati,
        zamijenjeni_clan,
      } = req.body;

      if (!ID_povjerenstva) {
        return res.status(400).json({ error: "Nedostaje ID_povjerenstva." });
      }
      if (!ID_zaposlenika) {
        return res.status(400).json({ error: "Nedostaje ID_zaposlenika." });
      }
      // dozvoli dodavanje članova samo u aktivnoj akademskoj godini
      const isActive = await PovjerenstvaPoZaposleniku.isPovjerenstvoInActiveYear(
        Number(ID_povjerenstva)
      );
      if (!isActive) {
        return res.status(403).json({
          error: "Dodavanje članova je moguće samo u aktivnoj akademskoj godini.",
        });
      }
      if (!uloga_clana || !String(uloga_clana).trim()) {
        return res.status(400).json({ error: "Uloga člana je obavezna." });
      }
      if (!pocetak_mandata || !String(pocetak_mandata).trim()) {
        return res.status(400).json({ error: "Početak mandata je obavezan." });
      }
      if (!procjena_radnih_sati || !String(procjena_radnih_sati).trim()) {
        return res.status(400).json({ error: "Procjena radnih sati je obavezna." });
      }

      const newId = await PovjerenstvaPoZaposleniku.create({
        ID_povjerenstva,
        ID_zaposlenika,
        uloga_clana: String(uloga_clana).trim(),
        pocetak_mandata: String(pocetak_mandata).trim(),
        kraj_mandata: kraj_mandata ? String(kraj_mandata).trim() : "",
        procjena_radnih_sati: String(procjena_radnih_sati).trim(),
        zamijenjeni_clan: zamijenjeni_clan ? Number(zamijenjeni_clan) : null,
      });

      return res.status(201).json({
        message: "Član povjerenstva je uspješno dodan!",
        id: newId.toString(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
