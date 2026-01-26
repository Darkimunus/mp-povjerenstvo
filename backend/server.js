import express from "express";
import cors from "cors";
import { pool } from "./db.js";

import { AkademskeGodine } from "./models/akademskeGodine.js";
import { authController } from "./controllers/authController.js";
import { zaposlenikovController } from "./controllers/zaposlenikovController.js";
import { verifyToken } from "./middleware/verifyToken.js";

import {akademskeGodineController} from "./controllers/akademskeGodineController.js";
import { izvjestajiController } from "./controllers/izvjestajiController.js";

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
// Get all users
app.get("/api/zaposlenici", verifyToken, zaposlenikovController.getAll);
// Get deleted users
app.get("/api/zaposlenici-deleted", verifyToken, zaposlenikovController.getDeleted);
// Create user
app.post("/api/zaposlenici", verifyToken, zaposlenikovController.create);
// Delete user
app.delete("/api/zaposlenici/:id", verifyToken, zaposlenikovController.deleteById);
// Reset password
app.post("/api/zaposlenici/:id/reset-password", verifyToken, zaposlenikovController.resetPassword);
// Toggle app user status
app.post("/api/zaposlenici/:id/toggle-app-user", verifyToken, zaposlenikovController.toggleAppUser);
// Restore user
app.post("/api/zaposlenici/:id/restore", verifyToken, zaposlenikovController.restoreUser);

//ZA AKADEMSKU GODINU
app.get("/api/akademske-godine", akademskeGodineController.getAll);
app.get("/api/akademske-godine/:id", akademskeGodineController.getById);
app.post("/api/akademske-godine", akademskeGodineController.create);

// TRAŽILICA ORG. JEDINICE – MORA BITI PRIJE DONJE RUTE POPISA ORG. JEDINICA!
app.get("/api/organizacijske-jedinice/search", organizacijskeJediniceController.searchByAkGodina);

// UREĐIVANJE ORG. JEDINICE
app.put("/api/organizacijske-jedinice/:idOrgJed", organizacijskeJediniceController.update);


// KREIRANJE ORG. JEDINICE
app.post("/api/organizacijske-jedinice", organizacijskeJediniceController.create);

// ZA ORG. JEDINICE
app.get("/api/organizacijske-jedinice/:idAkGodina", organizacijskeJediniceController.getAllByAkGodina);

//ZA TRAŽILICU POVJERENSTVA - MORA BIT PRIJE DONJE RUTE ZA POPIS POVJERENSTVA!
app.get("/api/povjerenstva/search", povjerenstvaController.searchByAkGodina);
//ZA POPIS POVJERENSTVA
app.post("/api/povjerenstva", povjerenstvaController.create);
// UREĐIVANJE POVJERENSTVA
app.put("/api/povjerenstva/:idPovjerenstva", povjerenstvaController.update);
//
app.get("/api/povjerenstva/:idOrgJed", povjerenstvaController.getAllByOrgJed);


//ZA DETALJE POVJERENSTVA
app.get("/api/povjerenstva-po-zaposleniku/povjerenstvo/:idPovjerenstva", povjerenstvaPoZaposlenikovController.getByPovjerenstvo);
app.get("/api/povjerenstva/detalji/:idPovjerenstva",povjerenstvaController.getDetalji);

app.post("/api/povjerenstva-po-zaposleniku", povjerenstvaPoZaposlenikovController.create);

// povjerenstva jednog zaposlenika
app.get("/api/povjerenstva-po-zaposleniku/zaposlenik/:idZaposlenika", povjerenstvaPoZaposlenikovController.getByZaposlenik);

//1, IZVJEŠTAJ - SASTAV POVJERENSTAVA
app.get (
  "/api/izvjestaji/sastav-povjerenstva",
  verifyToken,
  izvjestajiController.sastavPovjerenstava
);

//2. IZVJEŠTAJ - SUDJELOVANJE ZAPOSLENIKA
app.get(
  "/api/izvjestaji/sudjelovanje-zaposlenika",
  verifyToken,
  izvjestajiController.sudjelovanjeZaposlenika
);

//3. izvještaj - MANDATI PRI ISTEKU
app.get(
  "/api/izvjestaji/mandati-pri-isteku",
  verifyToken,
  izvjestajiController.mandatiPriIsteku
);


app.listen(3000, () =>
  console.log("Backend server running on http://localhost:3000")
);
