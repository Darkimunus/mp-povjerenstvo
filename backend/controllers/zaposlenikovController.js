import { Zaposlenici } from "../models/zaposlenici.js";

export const zaposlenikovController = {
  getAll: async (req, res) => {
    try {
      const zaposlenici = await Zaposlenici.getAll();
      res.json(zaposlenici);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const zaposlenik = await Zaposlenici.getById(id);
      
      if (!zaposlenik) {
        return res.status(404).json({ error: "Zaposlenik nije pronađen" });
      }
      
      res.json(zaposlenik);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
