import { AkademskeGodine } from "../models/akademskeGodine.js";

export const akademskeGodineController = {
  getAll: async (req, res) => {
    try {
      const akademskeGodine = await AkademskeGodine.getAll();
      res.json(akademskeGodine.map(g => ({
        ID_ak_godina: Number(g.ID_ak_godina), 
        godina: g.godina
      })));
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
        godina: akademskaGodina.godina
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }, //zagrada getById

  //KREIRANJE NOVE AKADEMSKE GODINE

  create: async (req, res) => {
    try{
      const {godina} = req.body;

      if (!godina) {
        return res.status(400).json({ error: "Godina je obavezna!"});
      }//if zagrada

      const newId = await AkademskeGodine.create(godina);

      res.json({message: "Akademska godina je uspješno kreirana!", id: newId.toString() });
    }//zagrada try

    catch (error) {
      res.status(500).json ({error: error.message});
    } //catch zagrada
  } //zagrada create


};
