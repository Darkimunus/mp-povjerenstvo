import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { AkademskeGodine } from "./models/akademskeGodine.js";

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

app.listen(3000, () =>
  console.log("Backend server running on http://localhost:3000")
);
