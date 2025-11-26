import { AkademskeGodine } from "../models/akademskeGodine.js";

export const akademskeGodineController = {
  getAll: async (req, res) => {
    try {
      const akademskeGodine = await AkademskeGodine.getAll();
      res.json(akademskeGodine);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const akademskaGodina = await AkademskeGodine.getById(id);
      
      if (!akademskaGodina) {
        return res.status(404).json({ error: "Akademska godina nije pronađena" });
      }
      
      res.json(akademskaGodina);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
