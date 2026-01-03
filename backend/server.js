import express from "express";
import cors from "cors";
import { pool } from "./db.js";

import { AkademskeGodine } from "./models/akademskeGodine.js";
import { authController } from "./controllers/authController.js";
import { zaposlenikovController } from "./controllers/zaposlenikovController.js";
import { verifyToken } from "./middleware/verifyToken.js";

import {akademskeGodineController} from "./controllers/akademskeGodineController.js";

//import za org. jedinice
import { organizacijskeJediniceController } from "./controllers/organizacijskeJediniceController.js";

// ZA POPIS POVJERENSTVA
import { povjerenstvaController } from "./controllers/povjerenstvaController.js";

//ZA POVJERENSTVA PO ZAPOSLENIKU
import { povjerenstvaPoZaposlenikovController } from "./controllers/povjerenstvaPoZaposlenikovController.js";

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

// Zaposlenici routes
app.get("/api/zaposlenici/:id", verifyToken, zaposlenikovController.getById);
app.put("/api/zaposlenici/:id", verifyToken, zaposlenikovController.updateById);

//ZA AKADEMSKU GODINU
app.get("/api/akademske-godine", akademskeGodineController.getAll);
app.get("/api/akademske-godine/:id", akademskeGodineController.getById);
app.post("/api/akademske-godine", akademskeGodineController.create);

// TRAŽILICA ORG. JEDINICE – MORA BITI PRIJE DONJE RUTE POPISA ORG. JEDINICA!
app.get("/api/organizacijske-jedinice/search", organizacijskeJediniceController.searchByAkGodina);
// ZA ORG. JEDINICE
app.get("/api/organizacijske-jedinice/:idAkGodina", organizacijskeJediniceController.getAllByAkGodina);

//ZA TRAŽILICU POVJERENSTVA - MORA BIT PRIJE DONJE RUTE ZA POPIS POVJERENSTVA!
app.get("/api/povjerenstva/search", povjerenstvaController.searchByAkGodina);
//ZA POPIS POVJERENSTVA
app.get("/api/povjerenstva/:idOrgJed", povjerenstvaController.getAllByOrgJed);

//ZA DETALJE POVJERENSTVA
app.get("/api/povjerenstva-po-zaposleniku/povjerenstvo/:idPovjerenstva", povjerenstvaPoZaposlenikovController.getByPovjerenstvo);
app.get("/api/povjerenstva/detalji/:idPovjerenstva",povjerenstvaController.getDetalji);

// povjerenstva jednog zaposlenika
app.get("/api/povjerenstva-po-zaposleniku/zaposlenik/:idZaposlenika", povjerenstvaPoZaposlenikovController.getByZaposlenik);


app.listen(3000, () =>
  console.log("Backend server running on http://localhost:3000")
);
