import { AkademskeGodine } from "../models/akademskeGodine.js";

export const akademskeGodineController = {
  getAll: async (req, res) => {
    try {
      const akademskeGodine = await AkademskeGodine.getAll();
      res.json(
        akademskeGodine.map((g) => ({
          ID_ak_godina: Number(g.ID_ak_godina),
          godina: g.godina,
          aktivna_ak_godina: Number(g.aktivna_ak_godina),
        }))
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const akademskaGodina = await AkademskeGodine.getById(Number(id));

      if (!akademskaGodina) {
        return res.status(404).json({ error: "Akademska godina nije pronađena" });
      }

      res.json({
        ID_ak_godina: Number(akademskaGodina.ID_ak_godina),
        godina: akademskaGodina.godina,
        aktivna_ak_godina: Number(akademskaGodina.aktivna_ak_godina),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // KREIRANJE NOVE AKADEMSKE GODINE (postavlja je kao aktivnu)
  create: async (req, res) => {
    try {
      const { godina } = req.body;

      if (!godina || !String(godina).trim()) {
        return res.status(400).json({ error: "Godina je obavezna!" });
      }

      const newId = await AkademskeGodine.createAsActive(String(godina).trim());

      return res.status(201).json({
        message: "Akademska godina je uspješno kreirana i postavljena kao aktivna!",
        id: newId.toString(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
