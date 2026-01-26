import { Povjerenstva } from "../models/povjerenstva.js";

export const povjerenstvaController = {
  getAllByOrgJed: async (req, res) => {
    try {
      const { idOrgJed } = req.params;
      const povjerenstva = await Povjerenstva.getAllByOrgJed(idOrgJed);
      res.json(povjerenstva);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // TRAŽILICA + FILTERI
  searchByAkGodina: async (req, res) => {
    try {
      const { search, idAkGodina } = req.query;
       if (!idAkGodina) {
        return res.status(400).json({ error: "Nedostaje akademska godina" });
      } //if zagrada

      const povjerenstva = await Povjerenstva.searchByAkGodina(
        search ?? "",
        Number(idAkGodina)
      );

      res.json(povjerenstva);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  // DETALJI POVJERENSTVA
  getDetalji: async (req, res) => {
    try {
      const id = Number(req.params.idPovjerenstva);
      const detalji = await Povjerenstva.getDetalji(id);
      res.json(detalji);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

   // KREIRANJE POVJERENSTVA
  create: async (req, res) => {
    try {
      const { naziv_povjerenstva, opis_povjerenstva, ID_org_jed } = req.body;

      if (!ID_org_jed) {
        return res.status(400).json({ error: "Nedostaje ID organizacijske jedinice." });
      }
       // provjera da je org. jedinica u aktivnoj akademskoj godini
      const isActive = await Povjerenstva.isOrgJedInActiveYear(Number(ID_org_jed));
      if (!isActive) {
        return res.status(403).json({
          error: "Dodavanje povjerenstva je moguće samo u aktivnoj akademskoj godini.",
        });
      }

      if (!naziv_povjerenstva || !String(naziv_povjerenstva).trim()) {
        return res.status(400).json({ error: "Naziv povjerenstva je obavezan!" });
      }

      if (!opis_povjerenstva || !String(opis_povjerenstva).trim()) {
        return res.status(400).json({ error: "Opis povjerenstva je obavezan!" });
      }

      const newId = await Povjerenstva.create(
        String(naziv_povjerenstva).trim(),
        String(opis_povjerenstva).trim(),
        Number(ID_org_jed)
      );

      return res.status(201).json({
        message: "Povjerenstvo je uspješno kreirano!",
        id: newId.toString(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // UREĐIVANJE POVJERENSTVA
update: async (req, res) => {
  try {
    const { idPovjerenstva } = req.params;
    const { naziv_povjerenstva, opis_povjerenstva } = req.body;

    if (!naziv_povjerenstva || !String(naziv_povjerenstva).trim()) {
      return res.status(400).json({ error: "Naziv povjerenstva je obavezan!" });
    }

    if (!opis_povjerenstva || !String(opis_povjerenstva).trim()) {
      return res.status(400).json({ error: "Opis povjerenstva je obavezan!" });
    }

    const existing = await Povjerenstva.getById(Number(idPovjerenstva));
    if (!existing) {
      return res.status(404).json({ error: "Povjerenstvo nije pronađeno." });
    }

    // dozvoli uređivanje samo u aktivnoj akademskoj godini
    // (provjera preko org. jedinice povjerenstva)
    const ok = await Povjerenstva.isOrgJedInActiveYear(Number(existing.ID_org_jed));
    if (!ok) {
      return res.status(403).json({
        error: "Uređivanje je moguće samo u aktivnoj akademskoj godini.",
      });
    }

    await Povjerenstva.update(
      Number(idPovjerenstva),
      String(naziv_povjerenstva).trim(),
      String(opis_povjerenstva).trim()
    );

    return res.status(200).json({ message: "Povjerenstvo je uspješno ažurirano!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},
};

