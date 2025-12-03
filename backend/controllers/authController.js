import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authController = {

    /* PRIJAVA KORISNIKA */    

  login: async (req, res) => {
    try {
      const { email, lozinka } = req.body;

      // Validate input
      if (!email || !lozinka) {
        return res.status(400).json({ error: "Email i lozinka su obavezni" });
      }

      const conn = await pool.getConnection();
      try {
        // Find user by email
        const rows = await conn.query(
          "SELECT * FROM db_zaposlenici WHERE email = ?",
          [email]
        );

        if (rows.length === 0) {
          return res.status(401).json({ error: "Neispravni podaci za prijavu" });
        }

        const user = rows[0];

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(lozinka, user.lozinka);

        if (!isPasswordValid) {
          return res.status(401).json({ error: "Neispravni podaci za prijavu" });
        }

        // Create JWT token
        const token = jwt.sign(
          { ID_zaposlenika: user.ID_zaposlenika, email: user.email },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        // Return user data (without password)
        res.json({
          message: "Prijava uspješna",
          token: token,
          user: {
            ID_zaposlenika: user.ID_zaposlenika,
            ime_zaposlenika: user.ime_zaposlenika,
            prezime_zaposlenika: user.prezime_zaposlenika,
            email: user.email
          }
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /* PROMJENA LOZINKE */

  changePassword: async (req, res) => {
    try {
      const { email, novaLozinka } = req.body;

      // Validate input
      if (!email  || !novaLozinka) {
        return res.status(400).json({ error: "Sva polja su obavezna" });
      }

      const conn = await pool.getConnection();
      try {
        
        const rows = await conn.query(
          "SELECT * FROM db_zaposlenici WHERE email = ?",
          [email]
        );

        if (rows.length == 0) {
          return res.status(404).json({ error: "Zaposlenik nije pronađen" });
        }

        const user = rows[0];

        // Hashiraj novu lozinku
        const newHash = await bcrypt.hash(novaLozinka, 10);

         // Ažuriraj lozinku
        await conn.query(
          "UPDATE db_zaposlenici SET lozinka = ? WHERE email = ?",
          [newHash, email]
        );

        return res.json({ message: "Lozinka je uspješno promijenjena!"});

          } finally {
        conn.release();
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }


};
