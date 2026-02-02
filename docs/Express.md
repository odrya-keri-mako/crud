# Express

#### Create aplication
```bash
cd backend
mkdir express
cd express
npm init -y
npm i express cors mysql2
npm i -D nodemon
```

#### Create environment (backend/express/.env)
```bash
touch .env
```

#### Set environment (backend/express/.env)
```ini
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=plants_and_animals
DB_PORT=3306
```

#### Modify (backend/express/package.json)
```json
{
  "name": "express",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.6",
    "express": "^5.2.1",
    "mysql2": "^3.16.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

#### Create databas connection (backend/express/src/db.js)
```bash
mkdir src
cd src
touch db.js
```

#### Replace (backend/express/src/db.js)
```js
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

export default pool;
```

#### Create validation (backend/express/src/validate.js)
```bash
touch validate.js
```

#### Replace (backend/express/src/validate.js)
```js
const MAX_IMAGE_KB = 64;

function isNonEmptyString(v, max = 255) {
  return typeof v === "string" && 
         v.trim().length > 0 && 
         v.trim().length <= max;
}

function isIntRange(v, min, max) {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max;
}

function base64ByteLength(base64) {
  const s = (base64 || "").replace(/\s/g, "");
  if (!s) return 0;
  const padding = (s.endsWith("==") ? 2 : s.endsWith("=") ? 1 : 0);
  return Math.floor((s.length * 3) / 4) - padding;
}

function validateInsectPayload(body, { requireAll = true } = {}) {
  const errors = [];

  const {
    name,
    img,
    img_type,
    type,
    metamorphosis,
    role,
    active_months,
    utility_level,
  } = body || {};

  const need = (field) => requireAll || body[field] !== undefined;

  if (need("name") && !isNonEmptyString(name, 255)) 
    errors.push("name invalid");
  if (need("type") && !isNonEmptyString(type, 50)) 
    errors.push("type invalid");
  if (need("metamorphosis") && !isNonEmptyString(metamorphosis, 20)) 
    errors.push("metamorphosis invalid");
  if (need("role") && !isNonEmptyString(role, 50)) 
    errors.push("role invalid");
  if (need("active_months") && !isNonEmptyString(active_months, 255)) 
    errors.push("active_months invalid");
  if (need("utility_level") && !isIntRange(utility_level, 1, 5)) 
    errors.push("utility_level must be 1-5");

  if (img !== undefined && img !== null && img !== "") {
    if (!isNonEmptyString(img_type, 50) || 
        !img_type.toLowerCase().startsWith("image/")) {
      errors.push("img_type invalid");
    }
    const bytes = base64ByteLength(img);
    if (bytes > MAX_IMAGE_KB * 1024) 
      errors.push(`img too large (max ${MAX_IMAGE_KB}KB)`);
  }

  return errors;
}

export default { validateInsectPayload };
```

#### Create routes (backend/express/src/routes/insects.routes.js)
```bash
mkdir routes
cd routes
touch insects.routes.js
```

#### Replace (backend/express/src/routes/insects.routes.js)
```js
import { Router } from "express";
import { query } from "../db";
import { validateInsectPayload } from "../validate";

const router = Router();

function mapRow(row) {
  return {
    ...row,
    img: row.img ? Buffer.from(row.img).toString("base64") : null,
  };
}

// GET (SELECT)
router.get("/", async (req, res) => {

  try {
    const [rows] = await query(
      `SELECT id, 
              name, 
              img, 
              img_type, type, 
              metamorphosis, 
              role, 
              active_months, 
              utility_level
         FROM insects
        ORDER BY id ASC`
    );
    res.json({ ok: true, data: rows.map(mapRow) });
  } catch (e) {
    res.status(500).json({ ok: false, error: "DB read error" });
  }
});

// POST (INSERT)
router.post("/", async (req, res) => {

  const errors = validateInsectPayload(req.body, { requireAll: true });
  if (errors.length) return res.status(400).json({ ok: false, error: errors.join(", ") });

  try {
    const {
      name, 
      img, 
      img_type, 
      type, 
      metamorphosis, 
      role, 
      active_months, 
      utility_level
    } = req.body;

    const imgBuf = img ? Buffer.from(img, "base64") : null;

    const [result] = await query(
      `INSERT INTO insects (
          name, 
          img, 
          img_type, 
          type, 
          metamorphosis, 
          role, 
          active_months, 
          utility_level
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ name.trim(), 
        imgBuf, 
        img_type || null, 
        type.trim(), 
        metamorphosis.trim(), 
        role.trim(), 
        active_months.trim(), 
        Number(utility_level)
      ]
    );

    res.json({ ok: true, data: { id: result.insertId } });
  } catch (e) {
    res.status(500).json({ ok: false, error: "DB insert error" });
  }
});

// PUT (UPDATE)
router.put("/:id", async (req, res) => {

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) 
    return res.status(400).json({ ok: false, error: "invalid id" });

  const errors = validateInsectPayload(req.body, { requireAll: false });
  if (errors.length) 
    return res.status(400).json({ ok: false, error: errors.join(", ") });

  try {
    const fields = [];
    const values = [];

    const set = (col, val) => { fields.push(`${col}=?`); values.push(val); };

    const b = req.body;
    if (b.name !== undefined) set("name", b.name.trim());
    if (b.type !== undefined) set("type", b.type.trim());
    if (b.metamorphosis !== undefined) set("metamorphosis", b.metamorphosis.trim());
    if (b.role !== undefined) set("role", b.role.trim());
    if (b.active_months !== undefined) set("active_months", b.active_months.trim());
    if (b.utility_level !== undefined) set("utility_level", Number(b.utility_level));

    if (b.img !== undefined) {
      const imgBuf = b.img ? Buffer.from(b.img, "base64") : null;
      set("img", imgBuf);
      set("img_type", b.img ? (b.img_type || null) : null);
    }

    if (!fields.length) 
      return res.status(400).json({ ok: false, error: "no fields to update" });

    values.push(id);

    const [result] = await query(
      `UPDATE insects SET ${fields.join(", ")} WHERE id=?`,
      values
    );

    res.json({ ok: true, data: { affectedRows: result.affectedRows } });
  } catch (e) {
    res.status(500).json({ ok: false, error: "DB update error" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) 
    return res.status(400).json({ ok: false, error: "invalid id" });

  try {
    const [result] = await query(`DELETE FROM insects WHERE id=?`, [id]);
    res.json({ ok: true, data: { affectedRows: result.affectedRows } });
  } catch (e) {
    res.status(500).json({ ok: false, error: "DB delete error" });
  }
});

export default router;
```

#### Create server (backend/express/src/server.js)
```bash
cd ..
touch server.js
```

#### Replace (backend/express/src/server.js)
```js
require("dotenv").config();

import express, { json } from "express";
import cors from "cors";

import insectsRoutes from "./routes/insects.routes";

const app = express();

app.use(cors({ origin: true }));
app.use(json({ limit: "2mb" })); 

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/insects", insectsRoutes);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API listening on :${port}`));
```