import { OrganizacijskeJedinice } from "../models/organizacijskeJedinice.js";

export const organizacijskeJediniceController = {
  getAllByAkGodina: async (req, res) => {
    try {
      const { idAkGodina } = req.params;
      const jedinice = await OrganizacijskeJedinice.getAllByAkGodina(
        Number(idAkGodina)
      );
      res.json(jedinice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // TRAŽILICA + FILTER
  searchByAkGodina: async (req, res) => {
    try {
      const { search, idAkGodina } = req.query;

      if (!idAkGodina) {
        return res.status(400).json({ error: "Nedostaje akademska godina" });
      }

      const jedinice = await OrganizacijskeJedinice.searchByAkGodina(
        search ?? "",
        Number(idAkGodina)
      );

      res.json(jedinice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
