import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authController = {
  register: async (req, res) => {
    try {
      const { ime, prezime, email, lozinka } = req.body;

      // Validate input
      if (!ime || !prezime || !email || !lozinka) {
        return res.status(400).json({ error: "Sva polja su obavezna" });
      }

      const conn = await pool.getConnection();
      try {
        // Check if email already exists
        const existingUser = await conn.query(
          "SELECT * FROM db_zaposlenici WHERE email = ?",
          [email]
        );

        if (existingUser.length > 0) {
          return res.status(409).json({ error: "Email je već registriran" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(lozinka, 10);

        // Insert new user
        const result = await conn.query(
          "INSERT INTO db_zaposlenici (ime_zaposlenika, prezime_zaposlenika, email, lozinka) VALUES (?, ?, ?, ?)",
          [ime, prezime, email, hashedPassword]
        );

        const userId = Number(result.insertId);

        // Create JWT token
        const token = jwt.sign(
          { ID_zaposlenika: userId, email: email },
          JWT_SECRET,
          { expiresIn: "3d" }
        );

        res.status(201).json({
          message: "Registracija uspješna",
          token: token,
          user: {
            ID_zaposlenika: userId,
            ime_zaposlenika: ime,
            prezime_zaposlenika: prezime,
            email: email
          }
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

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
  }
};
