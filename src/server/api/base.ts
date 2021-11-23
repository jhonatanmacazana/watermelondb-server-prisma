import { Router } from "express";

const baseRouter = Router();

baseRouter.get("/", (_req, res) => {
  return res.json({ message: "ok" });
});

export { baseRouter };
