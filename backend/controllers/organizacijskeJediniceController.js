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
  },

  // KREIRANJE ORG. JEDINICE
  create: async (req, res) => {
    try {
      const { naziv_org_jed, ID_ak_godina } = req.body;

      if (!ID_ak_godina) {
        return res.status(400).json({ error: "Nedostaje ID akademske godine." });
      }

      if (!naziv_org_jed || !String(naziv_org_jed).trim()) {
        return res.status(400).json({ error: "Naziv organizacijske jedinice je obavezan!" });
      }

      const newId = await OrganizacijskeJedinice.create(
        String(naziv_org_jed).trim(),
        Number(ID_ak_godina)
      );

      return res.status(201).json({
        message: "Organizacijska jedinica je uspješno kreirana!",
        id: newId.toString(),
      });
    } catch (error) {
      const status = error.statusCode || 500;
      res.status(status).json({ error: error.message });
    }
  },
};
