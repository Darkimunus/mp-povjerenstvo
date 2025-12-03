import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { AkademskeGodine } from "./models/akademskeGodine.js";
import { authController } from "./controllers/authController.js";
import { verifyToken } from "./middleware/verifyToken.js";

const app = express();
app.use(cors());
app.use(express.json());

// Example: test DB connection
app.get("/test", async (req, res) => {
  try {
    const rows = await pool.query("SELECT * FROM db_akademske_godine LIMIT 5");
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// Auth routes

app.post("/api/auth/login", authController.login);
app.post("/api/auth/change-password",  authController.changePassword);

// Protected route example
app.get("/api/profile", verifyToken, async (req, res) => {
  res.json({
    message: "Pristup dozvoljen",
    user: req.user
  });
});

app.listen(3000, () =>
  console.log("Backend server running on http://localhost:3000")
);
