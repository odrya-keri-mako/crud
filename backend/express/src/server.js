import express from "express";
import cors from "cors";
import insectsRoutes from "./routes/insects.routes.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/insects", insectsRoutes);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API listening on :${port}`));
