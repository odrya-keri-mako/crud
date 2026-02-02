import "./env.js";
import { createPool } from "mysql2/promise";

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  connectionLimit: 10,
  charset: "utf8mb4",
});

export const query = (sql, params = []) => pool.query(sql, params);
export default pool;
