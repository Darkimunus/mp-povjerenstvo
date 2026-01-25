import { OrganizacijskeJedinice } from "../models/organizacijskeJedinice.js";
import { AkademskeGodine } from "../models/akademskeGodine.js";

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

      // dozvoli kreiranje samo u aktivnoj akademskoj godini
      const isActive = await AkademskeGodine.isActive(Number(ID_ak_godina));
      if (!isActive) {
        return res.status(403).json({
          error: "Dodavanje organizacijskih jedinica je moguće samo u aktivnoj akademskoj godini.",
        });
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
  // UREĐIVANJE ORG. JEDINICE
update: async (req, res) => {
  try {
    const { idOrgJed } = req.params;
    const { naziv_org_jed } = req.body;

    if (!naziv_org_jed || !String(naziv_org_jed).trim()) {
      return res.status(400).json({ error: "Naziv organizacijske jedinice je obavezan!" });
    }

    const existing = await OrganizacijskeJedinice.getById(Number(idOrgJed));
    if (!existing) {
      return res.status(404).json({ error: "Organizacijska jedinica nije pronađena." });
    }

    // dozvoli uređivanje samo ako je akademska godina aktivna
    const isActive = await AkademskeGodine.isActive(Number(existing.ID_ak_godina));
    if (!isActive) {
      return res.status(403).json({
        error: "Uređivanje je moguće samo u aktivnoj akademskoj godini.",
      });
    }

    await OrganizacijskeJedinice.updateNaziv(Number(idOrgJed), String(naziv_org_jed).trim());

    return res.status(200).json({
      message: "Organizacijska jedinica je uspješno ažurirana!",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

};
