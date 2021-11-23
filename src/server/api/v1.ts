import { Router } from "express";

import { syncRouter } from "../routes/sync.routes";

const v1Router = Router();

v1Router.get("/", (_req, res) => {
  return res.json({ message: "ok" });
});

v1Router.use("/sync", syncRouter);

export { v1Router };
