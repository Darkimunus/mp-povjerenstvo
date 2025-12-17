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

  //DETALJI ZA PRIKAZ NA EKRANU DETALJA POVJERENSTVA
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
