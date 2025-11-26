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
  }
};
