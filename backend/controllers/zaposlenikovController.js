import { Zaposlenici } from "../models/zaposlenici.js";
import bcrypt from "bcrypt";

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
  },

  updateById: async (req, res) => {
    try {
      const { id } = req.params;
      const { ime_zaposlenika, prezime_zaposlenika, email, novaLozinka } = req.body;

      // Get current user
      const existingUser = await Zaposlenici.getById(id);
      if (!existingUser) {
        return res.status(404).json({ error: "Zaposlenik nije pronađen" });
      }

      // If email is provided and changed, check if it's already taken
      if (email && email !== existingUser.email) {
        const userWithEmail = await Zaposlenici.getByEmail(email);
        if (userWithEmail) {
          return res.status(400).json({ error: "Email je već u upotrebi" });
        }
      }

      // Prepare update data - only include provided fields
      const updateData = {
        ime_zaposlenika: ime_zaposlenika || existingUser.ime_zaposlenika,
        prezime_zaposlenika: prezime_zaposlenika || existingUser.prezime_zaposlenika,
        email: email || existingUser.email
      };

      // Hash password if provided
      if (novaLozinka) {
        updateData.lozinka = await bcrypt.hash(novaLozinka, 10);
      }

      // Update user
      const updatedUser = await Zaposlenici.updateById(id, updateData);

      if (!updatedUser) {
        return res.status(500).json({ error: "Greška pri ažuriranju podataka" });
      }

      res.json({
        message: "Zaposlenik uspješno ažuriran",
        ID_zaposlenika: updatedUser.ID_zaposlenika,
        ime_zaposlenika: updatedUser.ime_zaposlenika,
        prezime_zaposlenika: updatedUser.prezime_zaposlenika,
        email: updatedUser.email
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
