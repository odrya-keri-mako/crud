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