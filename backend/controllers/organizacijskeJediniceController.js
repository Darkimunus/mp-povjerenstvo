import { OrganizacijskeJedinice } from "../models/organizacijskeJedinice.js";

export const organizacijskeJediniceController = {
  getAllByAkGodina: async (req, res) => {
    try {
      const { idAkGodina } = req.params;
      const jedinice = await OrganizacijskeJedinice.getAllByAkGodina(Number(idAkGodina));
      res.json(jedinice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
