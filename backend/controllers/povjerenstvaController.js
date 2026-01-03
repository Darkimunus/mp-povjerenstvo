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
  }
};

