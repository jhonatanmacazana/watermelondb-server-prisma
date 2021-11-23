import { Router } from "express";

import { pointRouter } from "../routes/points.routes";

const v1Router = Router();

v1Router.get("/", (_req, res) => {
  return res.json({ message: "ok" });
});

v1Router.use("/points", pointRouter);

export { v1Router };
