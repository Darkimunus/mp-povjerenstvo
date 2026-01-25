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

  getDeleted: async (req, res) => {
    try {
      const zaposlenici = await Zaposlenici.getDeleted();
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
      const { ime_zaposlenika, prezime_zaposlenika, email, novaLozinka, korisnik_aplikacije } = req.body;

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

      // Handle korisnik_aplikacije field
      if (korisnik_aplikacije !== undefined && korisnik_aplikacije !== null) {
        updateData.korisnik_aplikacije = korisnik_aplikacije;
      }

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
        email: updatedUser.email,
        korisnik_aplikacije: updatedUser.korisnik_aplikacije
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const { ime_zaposlenika, prezime_zaposlenika, email, korisnik_aplikacije } = req.body

      if (!ime_zaposlenika || !prezime_zaposlenika || !email) {
        return res.status(400).json({ error: 'Sva polja su obavezna' })
      }

      const existing = await Zaposlenici.getByEmail(email)
      if (existing) {
        return res.status(409).json({ error: 'Email je već u upotrebi' })
      }

      const hashed = await bcrypt.hash('povjerenstvo123', 10)

      const newUser = await Zaposlenici.create({
        ime_zaposlenika,
        prezime_zaposlenika,
        email,
        lozinka: hashed,
        korisnik_aplikacije: korisnik_aplikacije ? 1 : 0
      })

      res.status(201).json(newUser)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Greška na serveru' })
    }
  },
  deleteById: async (req, res) => {
    try {
      const { id } = req.params

      const existing = await Zaposlenici.getById(id)
      if (!existing) {
        return res.status(404).json({ error: 'Zaposlenik nije pronađen' })
      }

      await Zaposlenici.deleteById(id)
      res.json({ message: 'Zaposlenik obrisan' })

    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Greška na serveru' })
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { id } = req.params
      const existing = await Zaposlenici.getById(id)


      if (!existing) {
        return res.status(404).json({ error: 'Zaposlenik nije pronađen' })
      }


      const hashed = await bcrypt.hash('povjerenstvo123', 10)
      await Zaposlenici.resetPasswordById(id, hashed)


      res.json({ message: 'Lozinka zadana na : povjerenstvo123 .' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  toggleAppUser: async (req, res) => {
    try {
      const { id } = req.params
      const existing = await Zaposlenici.getById(id)

      if (!existing) {
        return res.status(404).json({ error: 'Zaposlenik nije pronađen' })
      }

      const newStatus = existing.korisnik_aplikacije ? 0 : 1
      const updated = await Zaposlenici.updateById(id, { 
        ime_zaposlenika: existing.ime_zaposlenika,
        prezime_zaposlenika: existing.prezime_zaposlenika,
        email: existing.email,
        korisnik_aplikacije: newStatus 
      })

      res.json({ 
        message: 'Status korisnika ažuriran',
        korisnik_aplikacije: updated.korisnik_aplikacije 
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  restoreUser: async (req, res) => {
    try {
      const { id } = req.params
      const existing = await Zaposlenici.getById(id)

      if (!existing) {
        return res.status(404).json({ error: 'Zaposlenik nije pronađen' })
      }

      const restored = await Zaposlenici.updateById(id, {
        ime_zaposlenika: existing.ime_zaposlenika,
        prezime_zaposlenika: existing.prezime_zaposlenika,
        email: existing.email,
        korisnik_aplikacije: existing.korisnik_aplikacije,
        status_zaposlenika: 1
      })

      res.json({
        message: 'Zaposlenik vraćen',
        ID_zaposlenika: restored.ID_zaposlenika
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
};
