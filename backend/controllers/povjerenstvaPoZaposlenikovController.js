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
  }
};
