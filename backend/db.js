import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

export const pool = mariadb.createPool({
  host: "ucka.veleri.hr",
  user: "fmatanovi",
  password: "11",
  database: "fmatanovi",
  connectionLimit: 5
});
